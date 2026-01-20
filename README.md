# JavaScript-Python 解释器

![GitHub stars](https://img.shields.io/github/stars/QuickPie/js-python-interpreter?style=social&logo=github)
![GitHub license](https://img.shields.io/github/license/QuickPie/js-python-interpreter)
![GitHub last commit](https://img.shields.io/github/last-commit/QuickPie/js-python-interpreter/main)
![Python](https://img.shields.io/badge/Python-3.8-blue?logo=python)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)

用纯 JavaScript 实现的 Python 解释器，在浏览器中直接运行 Python 代码

## 截图预览

![JS Python解释器运行界面截图](https://quickpie.github.io/js-python-interpreter/docs/images/ui.png)

## 为什么设计这个项目

### 项目故事

---

<b>这是我的第一个 JavaScript 实践项目</b>。与其说它是由好奇心引起的，不如说它是一种<b>开拓、创造</b>的精神。

我是一名六年级的学生，对编程的兴趣溢于言表。我曾在机构里学习过1年的 Python，对 Python 的运用已经得心应手。但，当时的我自认为我对 Python 这门语言的开发已经达到尽头了，便探寻着新大陆。后来有一天，我突然对 Web 开发产生了兴趣，开始自学 JavaScript，半天不到就能自己编写程序，且发现 JavaScript 代码简单、易理解，却不失逻辑严谨与语法多样，于是就深深地陷入了这门语言。

一次，我打开了尘封已久的 Python 开发环境。望着我以前编写的复杂的代码，望着那不同高亮显示的语法，一个疯狂的念头突然从我的脑海中冒出——**用我刚接触的 JavaScript，去实现我熟悉的 Python**。这便是这个项目的由来。

实现这个念头的过程中，充满了各种困难阻碍：
* 为了理解词法分析器中索引指针的变化，我花了长时间做了好多次实验。
* 处理 Python 缩进和代码块时，我需要考虑缩进的丰富变化和各种代码块的模式。
* 处理 Python 异常时，我需要思考添加哪些属性，如何根据不同情况显示错误信息。
* ……

这些重重阻碍，不仅能提升我的 JavaScript 能力，**还让我对 Python 特性和语法有了更广、更深的理解**。

**所以，这个项目对我而言，是一条掌握 JavaScript 最高效的路径——通过实现一个我已知其所有细节的复杂系统（Python 解释器）。**

---

若想知道关于本项目更详细的信息，请看以下**项目说明**。

### 项目说明

---

**JavaScript-Python 解释器** - 一个用纯 JavaScript 从零实现的 Python 3.8 解释器，附有网页界面，在浏览器中直接运行。他可以是一个学习工具，更是一个深入理解编程语言底层逻辑（词法分析、语法分析、解释执行）的绝佳示范。对于使用这个项目有很高的自由度，你可以参阅代码、学习编译原理，了解 Python 代码是如何被执行的，你也可以帮助我尝试为其添加更多 Python 语法（如循环、函数等）……

## 实现原理

1. **词法分析**：将 Python 代码拆分成标记（token），构成标记流（token stream）
2. **语法分析**：用标记流构建抽象语法树（AST）
3. **解释执行**：遍历AST执行计算并输出结果

## 技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| JavaScript | 核心解释器逻辑 | ES6+ |
| HTML5/CSS3 | 网页界面 | - |
| CodeMirror | 代码高亮显示 | 5.65.2 |

## 功能特性

🎉🎉🎉 目前已实现本项目的整套流程（词法分析、语法分析、解释执行）！ 🎉🎉🎉

我将持续更新新语法，也会尽量每天都更新开发日志（[docs/development_log.md](https://github.com/QuickPie/js-python-interpreter/tree/main/docs/development_log.md)），其中涵盖我的一切更新、修改还有心得。

以下是本解释器的特色：

* **网页界面**
  * 实时代码编辑
  * 语法高亮显示
  * 运行结果输出
  * 错误信息提示

* **目前支持以下语法**（Python 3.8）
  * 基础字面量：数值、字符串、布尔值、空值`None`
  * 标识符
  * `print()`函数调用
  * 空表达式：`;`

## 快速开始

### 方法一：在线使用
1. [点击这里打开在线演示](https://quickpie.github.io/js-python-interpreter/)
2. 在打开的页面的左侧输入 Python 代码
3. 点击“运行代码”按钮或按下 Ctrl+Enter
4. 在右侧查看输出结果

### 方法二：本地运行

**选项A - 使用Git**

```bash
# 1. 下载项目
git clone https://github.com/QuickPie/js-python-interpreter.git

# 2. 进入项目文件夹
cd js-python-interpreter

# 3. 用浏览器打开
open index.html  # Mac
# 或直接双击 index.html 文件
```

**选项B - 直接下载**

1. 点击仓库页面的 Code → Download ZIP
2. 解压后双击打开 index.html 即可

## 项目结构

```text
js-python-interpreter/
├── index.html              # 主界面
├── main.js                 # 应用控制器
├── src/                    # 核心源码
│   ├── lexer.js            # 词法分析器
│   ├── parser.js           # 语法分析器
│   ├── interpreter.js      # 解释器
│   ├── token.js            # token和token类型
│   ├── token_patterns.js   # token匹配模板
│   ├── location.js         # 位置信息
│   ├── ast_nodes.js        # AST节点
│   ├── builtins.js         # 内置函数
│   ├── errors.js           # 异常
│   ├── environment.js      # 环境变量类
│   ├── literal_to_internal.js  # 解析字面量原始字符串为内部值
│   ├── indent_manager.js   # 缩进处理器（词法分析专用）
│   ├── source_context.js   # Python源码管理器
├── styles/                 # 页面样式
├── docs/                   # 文档与截图
├── README.md               # 项目说明
```

## 贡献

我欢迎各种形式的贡献，哪怕只是修改一个错别字、一个很小的 bug。以下是参与方式：

* **报告Bug**：在[Issues页面](https://github.com/QuickPie/js-python-interpreter/issues/)提交问题
* **建议功能**：告诉我缺少或你希望支持什么 Python 特性
* **改进代码**：先 Fork 项目，修改后提交 Pull Request

## 作者

**QuickPie** - 六年级学生开发者

### 关于我

* **编程经验**：1年 Python 、4年 C++ 学习
* **当前兴趣**：JavaScript、编译原理、Web 开发

### 联系我

* **GitHub**：[@QuickPie](https://github.com/QuickPie/)
* **问题反馈**：请通过 GitHub Issues
* 欢迎各位与我一起交流！还可以提供一些建议！

## 许可证

本项目采用 MIT 许可证

---

**⭐ 如果这个项目对你有帮助，请点个 Star 支持一下！ ⭐**
