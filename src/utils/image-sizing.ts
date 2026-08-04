import { PixelRatio } from "react-native";

const PICSUM = /^(https:\/\/picsum\.photos\/(?:id|seed)\/[^/]+)\/(\d+)\/(\d+)$/;
const PRAVATAR = /^(https:\/\/i\.pravatar\.cc)\/\d+(\?.*)?$/;

const BUCKETS = [40, 100, 200, 400, 600, 800, 1080, 1440];

const bucket = (px: number) => BUCKETS.find(b => b >= px) ?? 1440;

export function resized(uri: string, layoutWidth: number): string {
    const px = bucket(PixelRatio.getPixelSizeForLayoutSize(layoutWidth));

    const p = uri.match(PICSUM);
    if (p) {
        const [, base, w, h] = p;
        return `${base}/${px}/${Math.round(px * (Number(h) / Number(w)))}`;
    }

    const a = uri.match(PRAVATAR);
    if (a) {
        const [, base, query = ''] = a;
        return `${base}/${px}${query}`;
    }
    return uri;
}
