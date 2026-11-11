# -*- coding: utf-8 -*-
"""
把真实截图合成为站点用的 16:10 画布图。
- 手机竖屏截图（1280x2772）缩到高 860，单张居中 / 双张并排
- 桌面横图（1920x1078）按宽度 1400 适配
- 封面额外输出 800x500 缩略图
用法：python build-shots.py <源目录> <输出目录>
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFilter

CANVAS = (1600, 1000)
BG = (11, 13, 17)          # 深墨底，与站点 --color-ink-900 接近
GLOW = (46, 54, 66)
BORDER = (58, 66, 78)


def backdrop():
    """深底 + 一团柔光，避免纯色死板"""
    canvas = Image.new('RGB', CANVAS, BG)
    blob = Image.new('L', (600, 600), 0)
    ImageDraw.Draw(blob).ellipse([120, 120, 480, 480], fill=86)
    blob = blob.filter(ImageFilter.GaussianBlur(130)).resize(CANVAS)
    return Image.composite(Image.new('RGB', CANVAS, GLOW), canvas, blob)


def rounded(im, radius):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, im.size[0] - 1, im.size[1] - 1], radius=radius, fill=255)
    out = im.convert('RGB')
    out.putalpha(mask)
    return out


def shadow(size, radius, blur=26, alpha=185):
    pad = blur * 2
    layer = Image.new('RGBA', (size[0] + pad * 2, size[1] + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(
        [pad, pad, pad + size[0] - 1, pad + size[1] - 1], radius=radius, fill=(0, 0, 0, alpha))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def paste_shot(canvas, path, height, cx, cy, radius=24):
    im = Image.open(path).convert('RGB')
    scale = height / im.height
    w = max(1, int(round(im.width * scale)))
    im = im.resize((w, height), Image.LANCZOS)
    im = rounded(im, radius)
    sh = shadow((w, height), radius)
    x, y = int(cx - w / 2), int(cy - height / 2)
    canvas.paste(sh, (x - sh.width // 2 + w // 2, y - sh.height // 2 + height // 2), sh)
    canvas.paste(im, (x, y), im)
    ImageDraw.Draw(canvas).rounded_rectangle(
        [x, y, x + w - 1, y + height - 1], radius=radius, outline=BORDER, width=1)


def paste_wide(canvas, path, width, cy, radius=16):
    im = Image.open(path).convert('RGB')
    scale = width / im.width
    h = max(1, int(round(im.height * scale)))
    im = im.resize((width, h), Image.LANCZOS)
    im = rounded(im, radius)
    sh = shadow((width, h), radius)
    x, y = int(CANVAS[0] / 2 - width / 2), int(cy - h / 2)
    canvas.paste(sh, (x - sh.width // 2 + width // 2, y - sh.height // 2 + h // 2), sh)
    canvas.paste(im, (x, y), im)
    ImageDraw.Draw(canvas).rounded_rectangle(
        [x, y, x + width - 1, y + h - 1], radius=radius, outline=BORDER, width=1)


def compose_phone(out_path, shots, quality=84):
    canvas = backdrop()
    if len(shots) == 1:
        paste_shot(canvas, shots[0], 880, 800, 500)
    else:
        paste_shot(canvas, shots[0], 860, 560, 500)
        paste_shot(canvas, shots[1], 860, 1040, 500)
    canvas.save(out_path, 'JPEG', quality=quality, optimize=True, progressive=True)


def compose_wide(out_path, shot, quality=86):
    canvas = backdrop()
    paste_wide(canvas, shot, 1400, 500)
    canvas.save(out_path, 'JPEG', quality=quality, optimize=True, progressive=True)


def thumb(src, dst):
    im = Image.open(src)
    im.resize((800, 500), Image.LANCZOS).save(dst, 'JPEG', quality=80, optimize=True, progressive=True)


def main():
    root = sys.argv[1]
    out = sys.argv[2]
    p = lambda *a: os.path.join(root, *a)
    o = lambda n: os.path.join(out, n)
    jobs = [
        # (封面输出名, 封面图源, 图集[(输出名, 图源)])
        ('player-cover.jpg', [p('开源视频播放器', '开源视频播放器主页面.jpg'),
                              p('开源视频播放器', '开源视频播放器搜索样图（”小丑回魂“）.jpg')],
         [('player-1.jpg', p('开源视频播放器', '开源视频播放器主页面.jpg')),
          ('player-2.jpg', p('开源视频播放器', '开源视频播放器播放页面.jpg')),
          ('player-3.jpg', p('开源视频播放器', '开源视频播放器个人主页.jpg'))]),
        ('downloader-cover.jpg', [p('社媒无水印下载器', '社媒无水印下载器主页面.jpg'),
                                  p('社媒无水印下载器', '社媒无水印下载器解析样图（B站）.jpg')],
         [('downloader-1.jpg', p('社媒无水印下载器', '社媒无水印下载器解析历史.jpg')),
          ('downloader-2.jpg', p('社媒无水印下载器', '社媒无水印下载器解析样图（抖音）.jpg')),
          ('downloader-3.jpg', p('社媒无水印下载器', '社媒无水印下载器设置页面.jpg'))]),
    ]
    for cover, shots, gallery in jobs:
        compose_phone(o(cover), shots)
        thumb(o(cover), o(cover.replace('.jpg', '-thumb.jpg')))
        for name, src in gallery:
            compose_phone(o(name), [src])
        print('ok', cover, len(gallery))
    # 桌面横图项目
    compose_wide(o('relay-cover.jpg'), p('Claude Code Relay Proxy', 'Claude Code Relay Proxy扩展插件介绍页面.png'))
    thumb(o('relay-cover.jpg'), o('relay-cover-thumb.jpg'))
    compose_wide(o('relay-1.jpg'), p('Claude Code Relay Proxy', 'Claude Code Relay Proxy扩展插件对话页.png'))
    print('ok relay')


if __name__ == '__main__':
    main()