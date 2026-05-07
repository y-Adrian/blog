---
title: 汇编语言入门
date: 2026-05-07
category: 汇编
tags: [汇编, ARM, x86]
excerpt: 了解汇编语言的基础概念和常见架构。
---

# 汇编语言入门

汇编语言是最接近机器码的编程语言。

## 为什么学习汇编？

- **深入理解计算机**：知道代码实际上是如何执行的
- **逆向工程**：分析二进制程序的基础
- **性能优化**：在极端场景下优化代码

## x86 基础

```asm
section .data
    msg db 'Hello, World!', 0

section .text
    global _start
_start:
    mov eax, 4        ; sys_write
    mov ebx, 1       ; stdout
    mov ecx, msg
    mov edx, 13
    int 0x80         ; 调用内核

    mov eax, 1        ; sys_exit
    xor ebx, ebx
    int 0x80
```

---

*持续更新中...*
