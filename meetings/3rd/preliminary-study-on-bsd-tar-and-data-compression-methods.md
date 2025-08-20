---
sidebar_position: 4
---

# bsdtar 与压缩算法初探

**主讲人：Moroshima**

> 写在前面：本文中提到的所有压缩算法均为无损压缩算法，不涉及其他诸如图像、音视频等的有损压缩算法。

## 使 bsd 免于哀伤 —— bsdtar

### 何者为 bsdtar

[bsdtar(1)](https://man.freebsd.org/cgi/man.cgi?query=bsdtar&sektion=1&format=html)

```text
TAR(1)			    General Commands Manual			TAR(1)

NAME
       tar -- manipulate tape archives
```

tar 是为*磁带*所设计的归档操作工具。

```text
HISTORY
     A tar command appeared in Seventh Edition Unix, which was released in
     January, 1979.  There have been numerous other implementations, many of
     which extended the file format.  John Gilmore's pdtar public-domain
     implementation (circa November, 1987) was quite influential, and formed
     the basis of GNU tar.  GNU tar was included as the standard system tar in
     FreeBSD beginning with FreeBSD 1.0.

     This is a complete re-implementation based on the libarchive(3) library.
     It was first released with FreeBSD 5.4 in May, 2005.
```

bsdtar 正如其名，是一个使用 BSD License 的 tar 实现。而在提到 bsdtar 时，我们一般会将其与 libarchive 一并提起，这是因为 bsdtar 与 libarchive，一者为前端，一者为后端。

libarchive wiki 中是这样介绍的：

[Home · libarchive/libarchive Wiki](https://github.com/libarchive/libarchive/wiki#what-is-libarchive)

**Libarchive** is an open-source BSD-licensed C programming library that provides streaming access to a variety of different archive formats, including tar, cpio, pax, Zip, and ISO9660 images. The distribution also includes **bsdtar** and bsdcpio, full-featured implementations of tar and cpio that use libarchive.

### archive and compress

[File Compression and Archiving](https://archive.download.redhat.com/pub/redhat/linux/7.3/en/doc/RH-DOCS/rhl-gsg-en-7.3/s1-managing-compressing-archiving.html)

An archive file is not compressed, but a compressed file can be an archive file.

归档与压缩，bsdtar 是通过两部分实现的，其中归档格式相关的支持主要是通过内置的 libarchive 实现的；而压缩部分，即 filter 的支持则极为多样，既有 libarchive 内置的实现，也有使用外部 lib 的实现，此外还有调用外部 command-line tool 的实现。

具体支持情况 libarchive wiki 则给出了具有一定价值的参考文档 [LibarchiveFormats · libarchive/libarchive Wiki](https://github.com/libarchive/libarchive/wiki/LibarchiveFormats)。

当然，这份文档关于 Filter Support 部分的内容其实是不完整的，如果想要知道 bsdtar 究竟支持哪些压缩格式，更好的方式显然是直接去阅读源码：

[libarchive/libarchive: Multi-format archive and compression library](https://github.com/libarchive/libarchive)

`libarchive/archive_read_support_filter_all.c` (lines 40-84):

```c
int
archive_read_support_filter_all(struct archive *a)
{
	archive_check_magic(a, ARCHIVE_READ_MAGIC,
	    ARCHIVE_STATE_NEW, "archive_read_support_filter_all");

	/* Bzip falls back to "bunzip2" command-line */
	archive_read_support_filter_bzip2(a);
	/* The decompress code doesn't use an outside library. */
	archive_read_support_filter_compress(a);
	/* Gzip decompress falls back to "gzip -d" command-line. */
	archive_read_support_filter_gzip(a);
	/* Lzip falls back to "unlzip" command-line program. */
	archive_read_support_filter_lzip(a);
	/* The LZMA file format has a very weak signature, so it
	 * may not be feasible to keep this here, but we'll try.
	 * This will come back out if there are problems. */
	/* Lzma falls back to "unlzma" command-line program. */
	archive_read_support_filter_lzma(a);
	/* Xz falls back to "unxz" command-line program. */
	archive_read_support_filter_xz(a);
	/* The decode code doesn't use an outside library. */
	archive_read_support_filter_uu(a);
	/* The decode code doesn't use an outside library. */
	archive_read_support_filter_rpm(a);
	/* The decode code always uses "lrzip -q -d" command-line. */
	archive_read_support_filter_lrzip(a);
	/* Lzop decompress falls back to "lzop -d" command-line. */
	archive_read_support_filter_lzop(a);
	/* The decode code always uses "grzip -d" command-line. */
	archive_read_support_filter_grzip(a);
	/* Lz4 falls back to "lz4 -d" command-line program. */
	archive_read_support_filter_lz4(a);
	/* Zstd falls back to "zstd -d" command-line program. */
	archive_read_support_filter_zstd(a);

	/* Note: We always return ARCHIVE_OK here, even if some of the
	 * above return ARCHIVE_WARN.  The intent here is to enable
	 * "as much as possible."  Clients who need specific
	 * compression should enable those individually so they can
	 * verify the level of support. */
	/* Clear any warning messages set by the above functions. */
	archive_clear_error(a);
	return (ARCHIVE_OK);
}
```

`libarchive/archive_write_add_filter.c` (lines 39-71):

```c
/* A table that maps filter codes to functions. */
static const
struct { int code; int (*setter)(struct archive *); } codes[] =
{
	{ ARCHIVE_FILTER_NONE,		archive_write_add_filter_none },
	{ ARCHIVE_FILTER_GZIP,		archive_write_add_filter_gzip },
	{ ARCHIVE_FILTER_BZIP2,		archive_write_add_filter_bzip2 },
	{ ARCHIVE_FILTER_COMPRESS,	archive_write_add_filter_compress },
	{ ARCHIVE_FILTER_GRZIP,		archive_write_add_filter_grzip },
	{ ARCHIVE_FILTER_LRZIP,		archive_write_add_filter_lrzip },
	{ ARCHIVE_FILTER_LZ4,		archive_write_add_filter_lz4 },
	{ ARCHIVE_FILTER_LZIP,		archive_write_add_filter_lzip },
	{ ARCHIVE_FILTER_LZMA,		archive_write_add_filter_lzma },
	{ ARCHIVE_FILTER_LZOP,		archive_write_add_filter_lzip },
	{ ARCHIVE_FILTER_UU,		archive_write_add_filter_uuencode },
	{ ARCHIVE_FILTER_XZ,		archive_write_add_filter_xz },
	{ ARCHIVE_FILTER_ZSTD,		archive_write_add_filter_zstd },
	{ -1,			NULL }
};

int
archive_write_add_filter(struct archive *a, int code)
{
	int i;

	for (i = 0; codes[i].code != -1; i++) {
		if (code == codes[i].code)
			return ((codes[i].setter)(a));
	}

	archive_set_error(a, EINVAL, "No such filter");
	return (ARCHIVE_FATAL);
}
```

虽然代码中对 filter 调用处理的实际情况要复杂的多，但我们仍然可以对比二者得出一张关于 bsdtar 对各压缩算法支持情况的表格：

| filter            | compression program | ext             | tar ext                 | algorithm                                                    | libarchive built-in support | read | write |
| ----------------- | ------------------- | --------------- | ----------------------- | ------------------------------------------------------------ | --------------------------- | ---- | ----- |
| bzip2             | ✓                   | .bz2            | .tb2, .tbz, .tbz2, .tz2 | RLE + BWT + MTF + Huffman                                    | bz2lib                      | ✓    | ✓     |
| bzip3             | ✓                   | .bz3            |                         | RLE + BWT + MTF + Huffman                                    |                             |      |       |
| compress          | ✓                   | .Z              | .tZ, .taZ               | Lempel–Ziv–Welch                                             | ✓                           | ✓    | ✓     |
| gzip              | ✓                   | .gz             | .tgz, .taz              | DEFLATE (LZ77 + Huffman)                                     | zlib                        | ✓    | ✓     |
| lzip              | ✓                   | .lz             |                         | Lempel–Ziv–Markov chain (LZ77 + Range)                       | liblzma                     | ✓    | ✓     |
| lzma              | ✓                   | .lzma           | .tlz                    | Lempel–Ziv–Markov chain (LZ77 + Range)                       | liblzma                     | ✓    | ✓     |
| xz                | ✓                   | .xz             | .txz                    | Lempel–Ziv–Markov chain (LZ77 + Range)                       | liblzma                     | ✓    | ✓     |
| uuencode/uudecode |                     | .b64, .uu, .uue |                         |                                                              | ✓                           | ✓    | ✓     |
| rpm               |                     | .src.rpm        |                         |                                                              | ✓                           | ✓    |       |
| lrzip             | ✓                   | .lrz            |                         | rzip (LZ77) + normal compressor                              |                             | ✓    | ✓     |
| lzop              | ✓                   | .lzo            | .tzo                    | Lempel–Ziv–Oberhumer                                         |                             | ✓    | ✓     |
| grzip             | ✓                   | .grz            |                         | BWT + Schindler Transform + MTF + Weighted Frequency Counting |                             | ✓    | ✓     |
| lz4               | ✓                   | .lz4            |                         | LZ4                                                          |                             | ✓    | ✓     |
| zstd              | ✓                   | .zst            | .tzst                   | Zstandard                                                    |                             | ✓    | ✓     |

## 压缩算法

我们不可能使用**有损压缩算法**来去对文件进行压缩，因此我们这里只讨论**无损压缩算法**。**无损压缩算法**主要分为两大类：**熵编码**和**字典编码**

### 熵编码

学过通信原理第一章的人都知道什么是信息熵 —— 正如香农在《通信的数学原理》中所使用的描述的一样，是**每条消息中包含的信息的平均量**，用数学公式来表示即为

设系统 $S$ 内存在多个事件 $S = {E_1,...,E_n}$，每个事件的概率分布 $P = {p_1, ..., p_n}$，则有
$$
{\displaystyle H_{s}=\sum _{i=1}^{n}p_{i}I_{e}=-\sum _{i=1}^{n}p_{i}\log _{2}p_{i}}
$$
当然，实际应用中我们不可能依据香农编码来去进行数据传输，因为在解码过程中可能出现歧义，而诸如**哈夫曼编码**等的编码方法则很好的解决了这一问题。

### 字典编码

字典编码的原理相比熵编码就要朴素的多了，参见 [Dictionary coder - Wikipedia](https://en.wikipedia.org/wiki/Dictionary_coder)

（哈夫曼树其实也可以算一种字典，但与这里所提到的字典所发挥的作用完全不一样）

## Quick Start

| OPTIONS                 | DESCRIPTION                    |
| ----------------------- | ------------------------------ |
| `-x, --extract`         | 指定解压操作                   |
| `-v, --verbose`         | 详细输出信息                   |
| `-f, --file`            | 指定输入文件                   |
| `-c,--create`           | 创建 tarball                   |
| `-C, --cd, --directory` | 指定目标目录                   |
| `-a, --auto-compress`   | 根据文件拓展名自动决定压缩算法 |

#### 解压

```bash
tar -xvf xz-utils_5.6.1+really5.4.5.orig.tar.xz -C xz
```

#### 压缩

使用 compress 压缩算法进行压缩

```bash
tar --compress -cvf xz.tar.z xz/
```

使用 zstd 压缩算法进行压缩

```bash
tar --zstd -cvf ./hibike_euphonium_light_novel.tar.zst ./hibike_euphonium_light_novel
```

指定 zstd 压缩算法的压缩等级并启用多线程压缩

```bash
tar --zstd --options zstd:compression-level=22 --options zstd:threads=8 -cvf xz_22_multi_threads.tar.zst xz/
```

不额外打包 resource fork，详见后文“补充 > macOS”部分

```bash
tar --no-mac-metadata -acvf c.tar c
```

## 后记

### 性能

bsdtar 的性能表现要优于 GNU tar

### 安全

tarbomb

## 补充

### macOS

在 macOS 上使用 bsdtar 打包 tarball 存在会额外打包 resource fork 的问题，如果不想打包 resource fork，需要在命令中加上 `--no-mac-metadata` option。

此外 macOS 自带的 bsdtar/libarchive 版本过旧（截止 2024-05-16，`bsdtar --version` 为 `bsdtar 3.5.3 - libarchive 3.5.3 zlib/1.2.12 liblzma/5.4.3 bz2lib/1.0.8`），**不支持** zstd 压缩算法的多线程压缩（即 threads support），此功能的支持于 libarchive 3.6.0 添加（参见 [Release Libarchive 3.6.0 · libarchive/libarchive](https://github.com/libarchive/libarchive/releases/tag/v3.6.0)），需要注意。

#### 参考

[Resource fork - Wikipedia](https://en.wikipedia.org/wiki/Resource_fork)

[command line - Tar excluding ._ files - Ask Different](https://apple.stackexchange.com/questions/280913/tar-excluding-files)

### 7z

| Commands & Switches | Description              |
| ------------------- | ------------------------ |
| a                   | add files to archive     |
| -p                  | set password             |
| -mhe                | enable header encryption |

```bash
7z a archives.7z -p"fucktencent" -mhe hibike_euphonium_light_novel
```

#### 修复损坏的 7z 压缩文件

[How to recover corrupted 7z archive](https://www.7-zip.org/recover.html)

#### 参考

[p7zip - ArchWiki](https://wiki.archlinux.org/title/p7zip#Examples)

[Command line 7zip issues when encrypting headers - Stack Overflow](https://stackoverflow.com/questions/26874594/command-line-7zip-issues-when-encrypting-headers)

[7-Zip 常用压缩/解压缩命令行指令](https://blog.yasking.org/a/terminal-7z-usage.html)

## 参考

[Archiving and compression - ArchWiki](https://wiki.archlinux.org/title/Archiving_and_compression)

[libarchive 介绍与入门 - iris](https://blog.ginshio.org/2023/libarchive_development_001/) 此文内容多有谬误，仅供参考

[linux - How do I extract the contents of an rpm? - Stack Overflow](https://stackoverflow.com/questions/18787375/how-do-i-extract-the-contents-of-an-rpm)

[Markov information source - Wikipedia](https://en.wikipedia.org/wiki/Markov_information_source)

[command line - Tar excluding ._ files - Ask Different](https://apple.stackexchange.com/questions/280913/tar-excluding-files)