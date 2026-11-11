<script setup>
/**
 * 联系区
 * 职责：给出三种联系方式，各自适配「已填写」和「还没填」两种状态。
 *
 * 邮箱做成可一键复制：
 *   很多人看作品集是在手机上，长按选中一串邮箱地址很烦；点一下就能复制才对。
 *   复制结果用全局 Toast 反馈（成功 / 失败两种文案），不弹 alert。
 *
 * 二维码留成虚线预留位：
 *   宁可显示「还没放」，也不要放一张假二维码——扫出来是别人的号比没有更糟。
 */
import AppIcon from '@/components/AppIcon.vue'
import { copyText } from '@/composables/useClipboard.js'
import { showToast } from '@/composables/useToast.js'
import {
  contactEmail,
  contactGitHub,
  contactResume,
  contactResumeFileName,
  contactWechatQr,
} from '@/data/contact.js'
import { asset } from '@/utils/asset.js'

async function copyEmail() {
  const ok = await copyText(contactEmail)
  showToast(ok ? '邮箱已复制' : '复制失败，请手动选中地址', ok ? 2000 : 2600)
}
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
    <div class="grid gap-4">
      <!-- 邮箱：可复制 -->
      <section class="rounded-lg border border-line-subtle bg-surface p-5">
        <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-faint">
          <AppIcon name="mail" :size="14" />
          Email
        </p>

        <div v-if="contactEmail" class="mt-3 flex flex-wrap items-center gap-3">
          <a
            :href="`mailto:${contactEmail}`"
            class="break-all font-mono text-sm text-fg transition-colors duration-base ease-out-soft hover:text-accent"
          >
            {{ contactEmail }}
          </a>
          <button
            type="button"
            :aria-label="`复制邮箱地址 ${contactEmail}`"
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-xs text-fg-secondary transition-colors duration-base ease-out-soft hover:border-accent hover:text-accent"
            @click="copyEmail"
          >
            <AppIcon name="copy" :size="12" />
            复制
          </button>
        </div>

        <!-- 未填写：给出明确的落点，而不是一个点不动的按钮 -->
        <p v-else class="mt-3 font-mono text-xs leading-relaxed text-fg-faint">
          [ 待填写：在 src/data/profile.json 的 contact.email 填上邮箱 ]
        </p>
      </section>

      <!-- GitHub -->
      <section class="rounded-lg border border-line-subtle bg-surface p-5">
        <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-faint">
          <AppIcon name="branch" :size="14" />
          GitHub
        </p>

        <a
          v-if="contactGitHub"
          :href="contactGitHub"
          target="_blank"
          rel="noreferrer"
          class="mt-3 inline-flex items-center gap-1.5 break-all font-mono text-sm text-fg transition-colors duration-base ease-out-soft hover:text-accent"
        >
          {{ contactGitHub.replace(/^https?:\/\//, '') }}
          <AppIcon name="arrow-up-right" :size="13" />
        </a>

        <p v-else class="mt-3 font-mono text-xs leading-relaxed text-fg-faint">
          [ 待填写：在 src/data/profile.json 的 contact.github 填上主页地址 ]
        </p>
      </section>

      <!-- 简历：文件在 public/resume.pdf，换简历覆盖同名文件即可 -->
      <section v-if="contactResume" class="rounded-lg border border-line-subtle bg-surface p-5">
        <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-faint">
          <AppIcon name="book" :size="14" />
          Resume
        </p>

        <a
          :href="contactResume"
          :download="contactResumeFileName"
          class="mt-3 inline-flex items-center gap-1.5 font-mono text-sm text-fg transition-colors duration-base ease-out-soft hover:text-accent"
        >
          <AppIcon name="download" :size="13" />
          下载 PDF 简历
        </a>

        <p class="mt-2 font-mono text-xs text-fg-faint">一页纸，含教育经历、实习与项目经历</p>
      </section>
    </div>

    <!--
      微信二维码：有图渲染图，没图留位置。
      卡片在任何宽度都是正方形（宽高都写死 12.25rem = 196px），窄屏时居中：
      二维码是正方形，横着长的气泡会让它四周留白不均，看着像被塞进去的。
      用 aspect-square 时高度会被内容撑到 201px（标签行高 21px 比预留的 16px 高），
      所以这里直接写死高度，多出的 5px 只吃掉底部内边距，不会裁到二维码。
    -->
    <section class="mx-auto flex h-[12.25rem] w-[12.25rem] flex-col rounded-lg border border-line-subtle bg-surface p-5 sm:mx-0">
      <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-faint">
        <AppIcon name="qr" :size="14" />
        WeChat
      </p>

      <img
        v-if="contactWechatQr"
        :src="asset(contactWechatQr)"
        alt="微信二维码，扫码添加周涛"
        width="128"
        height="128"
        loading="lazy"
        decoding="async"
        class="mt-3 h-32 w-32 self-center rounded-md border border-line-subtle object-contain"
      />

      <div
        v-else
        class="mt-3 flex h-32 w-32 flex-col items-center justify-center gap-2 self-center rounded-md border border-dashed border-line text-center"
      >
        <AppIcon name="qr" :size="22" class="text-fg-faint" />
        <span class="font-mono text-xs leading-relaxed text-fg-faint">二维码<br />预留位</span>
      </div>
    </section>
  </div>
</template>
