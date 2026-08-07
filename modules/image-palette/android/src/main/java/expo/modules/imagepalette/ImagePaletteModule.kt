package expo.modules.imagepalette

import androidx.tracing.Trace
import android.util.Log
import expo.modules.kotlin.KPromiseWrapper
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.concurrent.thread

class ImagePaletteModule : Module() {

  private var config = Config()
  private var firstReadOccurred = false
  private val paletteCache = PaletteCache()

  private fun log(msg: String) {
    Log.d(TAG, "[ImagePalette] $msg")
  }

  override fun definition() = ModuleDefinition {
    Name("ImagePalette")

    OnDestroy {
      paletteCache.clear()
      config = Config()
      firstReadOccurred = false
    }

    Function("configure") { options: PaletteConfigOptions ->
      if (firstReadOccurred) {
        log("configure() ignored: must be called before the first getDominantColors() call")
        return@Function
      }
      val warnings = config.apply(options)
      warnings.forEach { log("configure: $it — ignored") }
    }

    AsyncFunction("getDominantColors") { uri: String, promise: Promise ->
      val cookie = uri.hashCode()
      Trace.beginAsyncSection("ImagePalette.request", cookie)
      thread {
        try {
          firstReadOccurred = true
          val cfg = config.copy()
          log("start")

          val key = PaletteKey.fromConfig(uri, cfg)
          if (cfg.cache) {
            paletteCache.get(key)?.let {
              log("cache HIT")
              promise.resolve(respond(it, cfg))
              return@thread
            }
            log("cache MISS")
          }

          val path = if (uri.startsWith("file://")) uri.removePrefix("file://") else uri

          val bitmap = ImageDecoder.decode(path, cfg.downsample, cfg.downsampleTargetSize)
          if (bitmap == null) {
            promise.resolve(null)
            return@thread
          }

          val decoded = ImageDecoder.extractARGB(bitmap)

          val swatches = HistogramQuantizer.quantize(
            decoded,
            cfg.gridWidth,
            cfg.gridHeight,
            cfg.edgesOnly,
            cfg.bitsPerChannel
          )

          if (cfg.cache) {
            paletteCache.set(key, swatches)
          }

          log("resolved")
          promise.resolve(respond(swatches, cfg))
        } catch (e: Throwable) {
          promise.reject("ERR_PALETTE", e.message ?: "palette extraction failed", e)
        } finally {
          Trace.endAsyncSection("ImagePalette.request", cookie)
        }

      }
    }
  }

  private fun respond(swatches: List<InternalSwatch>, config: Config): Map<String, Any> {
    return mapOf(
      "gridWidth" to config.gridWidth,
      "gridHeight" to config.gridHeight,
      "swatches" to swatches.map {
        mapOf(
          "row" to it.row,
          "col" to it.col,
          "r" to it.r,
          "g" to it.g,
          "b" to it.b,
          "population" to it.population
        )
      }
    )
  }

  companion object {
    private const val TAG = "ImagePalette"
  }
}
