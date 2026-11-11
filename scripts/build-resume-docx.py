# -*- coding: utf-8 -*-
"""按「技术版」内容重排原 Word 简历，保留原版式与证件照。

用法：
    python scripts/build-resume-docx.py <原docx> <输出docx>

设计原则（很重要，改脚本前先读）：
1. 只改文字，不新建任何 <w:drawing>。证件照锚点段落（原 #0）与小标题装饰条
   （原 #7/#10/#20/#32/#38）全部原样复用，一个字节都不动。
2. 段落格式一律从原件的现成段落克隆，不新造样式：
   - 小标题  -> 原 #7 / #10 / #20 / #32 / #38（自带装饰图形，只能改 <w:t>）
   - 条目行  -> 原 #11（加粗左标题 + 制表位 + 右对齐日期）
   - bullet -> 原 #12（文本自带 "• " 前缀，ind firstLine=420）
   - 纯文本  -> 原 #5（9.5pt）/ 原 #12 去掉前缀改为 fli=0
3. 章节顺序沿用原件：简介、项目、实习、技能、教育。
"""
import copy
import sys

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


# ---------------------------------------------------------------- 文本工具

def set_run_text(run, text, strip_italic=False):
    """把一个 <w:r> 的内容换成纯文本，保留它的 <w:rPr>（字体、字号、加粗）。"""
    rpr = run.find(qn("w:rPr"))
    if strip_italic and rpr is not None:
        for tag in ("w:i", "w:iCs"):
            el = rpr.find(qn(tag))
            if el is not None:
                rpr.remove(el)
    for child in list(run):
        if child.tag != qn("w:rPr"):
            run.remove(child)
    t = OxmlElement("w:t")
    t.set(qn("xml:space"), "preserve")
    t.text = text
    run.append(t)


def runs_of(p):
    return p.findall(qn("w:r"))


def text_run(p):
    """找出小标题段里真正承载文字的 run。

    小标题段里还混着承载装饰图形的 run（有的直接是 <w:drawing>，有的包在
    <w:alternateContent> 里），按固定下标取会取错，所以按「有 <w:t> 且没有图形」
    来判定。
    """
    for r in runs_of(p):
        if r.find(qn("w:drawing")) is not None or r.find(qn("w:pict")) is not None:
            continue
        if r.find(qn("w:t")) is not None:
            return r
    raise RuntimeError("小标题段落里找不到文字 run，无法换字")


def fill_paragraph(p, text):
    """单 run 段落（bullet / 纯文本）：只留第一个 run 换字。"""
    rs = runs_of(p)
    if not rs:
        raise RuntimeError("模板段落没有 run，无法复用")
    set_run_text(rs[0], text)
    for r in rs[1:]:
        p.remove(r)


def fill_entry(p, left, right):
    """条目行：左标题 + 制表位 + 右对齐日期。模板是原 #11。"""
    rs = runs_of(p)
    tab_i = next((i for i, r in enumerate(rs) if r.find(qn("w:tab")) is not None), None)
    if tab_i is None:
        raise RuntimeError("条目行模板里没有制表位")
    left_runs = rs[:tab_i]
    right_runs = rs[tab_i + 1:]

    set_run_text(left_runs[0], left)
    for r in left_runs[1:]:
        p.remove(r)

    if not right_runs:
        raise RuntimeError("条目行模板里没有日期 run")
    set_run_text(right_runs[0], right, strip_italic=True)
    for r in right_runs[1:]:
        p.remove(r)


def set_first_line_indent(p, twips):
    """改段落的悬挂/首行缩进（twips）。"""
    ppr = p.find(qn("w:pPr"))
    ind = ppr.find(qn("w:ind"))
    if ind is None:
        ind = OxmlElement("w:ind")
        ppr.append(ind)
    ind.set(qn("w:firstLine"), str(twips))
    ind.set(qn("w:firstLineChars"), "0")


def set_space_after(p, twips):
    """改段落的段后距（twips）。普通正文行要收紧到 0，避免多段累计把内容顶到第 2 页。"""
    ppr = p.find(qn("w:pPr"))
    spacing = ppr.find(qn("w:spacing"))
    if spacing is None:
        spacing = OxmlElement("w:spacing")
        ppr.append(spacing)
    spacing.set(qn("w:after"), str(twips))


def set_space_before(p, twips):
    """改段落的段前距（twips）。只给首个小标题加一点，避免贴着上面的作品集行。"""
    ppr = p.find(qn("w:pPr"))
    spacing = ppr.find(qn("w:spacing"))
    if spacing is None:
        spacing = OxmlElement("w:spacing")
        ppr.append(spacing)
    spacing.set(qn("w:before"), str(twips))


# ---------------------------------------------------------------- 正文内容

INTRO = (
    "从 Python 自动化脚本起手，现在做 Android 客户端与 AI 工具链。独立完成三个可发布产品："
    "FFmpeg 播放器、社媒无水印下载器、Claude Code 协议转换扩展——交付的是装上就能用的"
    "完整产物，不是跑在本地的一段代码。"
)

PROJECTS = [
    {
        "left": "开源视频播放器｜独立开发 · 播放内核 / 界面 / 源解析 / 打包",
        "right": "2026",
        "tech": "技术栈：FFmpeg · 自定义播放内核 · 影视源解析 · Android · 多线程",
        "bullets": [
            "• 解封装与解码交给 FFmpeg，播放内核自研并分层（解封装 / 解码 / 渲染），"
            "不依赖系统播放器，冷门封装也能直接播",
            "• 二十多个影视源抽成独立配置，每个源一条解析规则，源站改版只改配置不动内核，"
            "新增源不必重新理解整条播放链路",
            "• 异常码流只影响当前这一路、不整段黑屏；交付形态是一个安装包，不装运行时也能用",
        ],
    },
    {
        "left": "社媒无水印下载器｜独立开发 · 接口解析 / 队列 / 打包",
        "right": "2026",
        "tech": "技术栈：接口解析 · 任务队列 · 并发下载 · Android · 单文件打包",
        "bullets": [
            "• 解析拆成「取页面 → 定位播放信息 → 还原媒体地址」三步，平台改版只动其中一处",
            "• 下载走任务队列，并发不设上限，每条任务独立记录进度与失败原因，单条失败只重试自己",
            "• 直取平台原始媒体流，无二次转码与水印；批量 20+ 任务实测无异常后发版，"
            "成品 67 MB 单文件安装包",
        ],
    },
    {
        "left": "Claude Code Relay Proxy｜VS Code 扩展 · 独立开发",
        "right": "2026",
        "tech": "技术栈：TypeScript · VS Code API · 协议转换 · OpenAI 兼容格式 · Node.js",
        "bullets": [
            "• 本地起一层代理做双向转换，OpenAI 格式请求翻成 Claude Code 认的接口，"
            "流式事件再拼回去",
            "• 兼容 OpenAI / Claude / DeepSeek 中转站，换站只改一处配置，"
            "只在 VS Code 内生效、不接管系统代理",
        ],
    },
]

EXPERIENCES = [
    {
        "left": "中国联通－市场推广·宣传部",
        "right": "2023.10-2024.06",
        "bullets": ["• 校园推广活动执行与开卡办理，信息录入零差错，累计拓展新客户 15+"],
    },
    {
        "left": "第六届星光夜市暨旧物市场－现场运维专员",
        "right": "2025.12",
        "bullets": ["• 20+ 摊位现场协调与突发处理，两天活动零重大问题"],
    },
    {
        "left": "学生处－档案助理 / 班长",
        "right": "2023.10-2024.04",
        "bullets": ["• 档案归档与疑难问题台账，负责班级日常事务对接"],
    },
]

SKILLS = [
    "客户端与音视频：FFmpeg 全格式解码 · 自研分层播放内核 · Android 客户端 · 单文件打包",
    "前端开发：Vue 3 · TypeScript · Tailwind CSS（设计 token）· 响应式布局（375/768/1440）",
    "协议与工具：接口协议转换 · OpenAI / Claude / DeepSeek 对接 · VS Code 扩展 · 影视源解析",
    "工程化：Git 规范 · 问题定位 · 文档编写 · 需求 → 开发 → 打包 → 发布全流程独立交付",
]

CERTS = "证书：全国计算机等级二级 · 普通话二级乙等 · C1 驾照"

EDUCATION = ("合肥城市学院　城市管理（本科）", "2023.09-2027.07")


def build(src, dst):
    doc = Document(src)
    body = doc.element.body

    # 原件的段落元素（按文档顺序）
    ps = [el for el in body if el.tag == qn("w:p")]
    if len(ps) < 43:
        raise RuntimeError("原文档段落数异常：%d" % len(ps))

    p_photo, p_name, p_blank1, p_blank2 = ps[0], ps[1], ps[2], ps[3]
    p_phone, p_portfolio, p_blank3 = ps[4], ps[5], ps[6]
    h_intro, h_project, h_exp, h_skill, h_edu = ps[7], ps[10], ps[20], ps[32], ps[38]
    tpl_entry = copy.deepcopy(ps[11])
    tpl_bullet = copy.deepcopy(ps[12])
    tpl_head = copy.deepcopy(ps[5])    # 头部 9.5pt 行（求职方向沿用作品集行的字号）
    tpl_body = copy.deepcopy(ps[12])   # 正文 8.5pt 行（与原件正文、bullet 同级）

    # ---- 头部：姓名/电话/作品集沿用，补一行求职方向
    import copy as _copy

    p_role = _copy.deepcopy(tpl_head)
    fill_paragraph(p_role, "客户端开发 / 前端开发 / 工具开发　·　2027 届本科")
    fill_paragraph(p_portfolio, "作品集：siyu0209.github.io　·　GitHub：github.com/siyu0209")

    # ---- 各章节
    def new_entry(left, right):
        el = copy.deepcopy(tpl_entry)
        fill_entry(el, left, right)
        return el

    def new_bullet(text):
        el = copy.deepcopy(tpl_bullet)
        fill_paragraph(el, text)
        return el

    def new_plain(text, hanging=False):
        el = copy.deepcopy(tpl_body)
        fill_paragraph(el, text)
        if hanging:
            # 技术栈行：与 bullet 文本左对齐（0.74cm），并保留 4pt 段后距与下文 bullet 分开
            set_first_line_indent(el, 420)
        else:
            set_first_line_indent(el, 0)
            set_space_after(el, 0)
        return el

    stack = []

    # 01 个人简介
    set_run_text(text_run(h_intro), "个人简介")
    set_space_before(h_intro, 80)  # 4pt：上面没有空白段了，靠段前距与作品集行拉开
    stack += [h_intro, new_plain(INTRO)]

    # 02 项目经历
    set_run_text(text_run(h_project), "项目经历")
    stack.append(h_project)
    for proj in PROJECTS:
        stack.append(new_entry(proj["left"], proj["right"]))
        stack.append(new_plain(proj["tech"], hanging=True))
        for b in proj["bullets"]:
            stack.append(new_bullet(b))

    # 03 实习与校园经历
    set_run_text(text_run(h_exp), "实习与校园经历")
    stack.append(h_exp)
    for exp in EXPERIENCES:
        stack.append(new_entry(exp["left"], exp["right"]))
        for b in exp["bullets"]:
            stack.append(new_bullet(b))

    # 04 技能与证书
    set_run_text(text_run(h_skill), "技能与证书")
    stack.append(h_skill)
    for line in SKILLS:
        stack.append(new_plain(line))
    stack.append(new_plain(CERTS))

    # 05 教育背景
    set_run_text(text_run(h_edu), "教育背景")
    stack.append(h_edu)
    stack.append(new_entry(*EDUCATION))

    # ---- 重排 body：先清掉所有段落，再按新顺序插回，sectPr 留在最后
    sect_pr = body.find(qn("w:sectPr"))
    for el in ps:
        body.remove(el)
    # 头部只保留「姓名 / 求职方向 / 电话邮箱 / 作品集」四行：
    # 去掉 ps[2] 与 ps[6] 两个空白间隔段，腾出约两行高度给正文（否则末尾教育背景会被顶出页面）
    head = [p_photo, p_name, p_role, p_phone, p_portfolio]
    for el in head + stack:
        if sect_pr is not None:
            sect_pr.addprevious(el)
        else:
            body.append(el)

    doc.save(dst)
    return dst


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("usage: build-resume-docx.py <src.docx> <dst.docx>")
        sys.exit(1)
    print(build(sys.argv[1], sys.argv[2]))
