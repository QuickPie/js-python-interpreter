# JavaScript-Python 解释器

![GitHub stars](https://img.shields.io/github/stars/QuickPie/js-python-interpreter?style=social&logo=github)
![GitHub license](https://img.shields.io/github/license/QuickPie/js-python-interpreter)
![GitHub last commit](https://img.shields.io/github/last-commit/QuickPie/js-python-interpreter/main)
![Python](https://img.shields.io/badge/Python-3.8-blue?logo=python)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)

> 用纯JavaScript实现的Python解释器，在浏览器中直接运行Python代码

## 截图预览
![JS Python解释器运行界面截图](/docs/images/ui.png)

## 快速开始

### 方法一：在线使用
1. [点击这里打开在线演示](https://quickpie.github.io/js-python-interpreter/)
2. 在打开的页面的左侧输入Python代码
3. 点击“运行代码”按钮或按下 Ctrl+Enter
4. 在右侧查看输出结果

### 方法二：本地运行
```bash
# 1. 下载项目
git clone https://github.com/QuickPie/js-python-interpreter.git

# 2. 进入项目文件夹
cd js-python-interpreter

# 3. 用浏览器打开
open index.html  # Mac
# 或直接双击 index.html 文件
```

## 技术细节

### 实现原理
1. **词法分析**：将Python代码拆分成标记（token），构成标记流（token stream）
2. **语法分析**：用标记流构建抽象语法树（AST）
3. **解释执行**：遍历AST执行计算并输出结果

### 技术栈
| 技术 | 用途 | 版本 |
|------|------|------|
| JavaScript | 核心解释器逻辑 | ES6+ |
| HTML5/CSS3 | 网页界面 | - |
| CodeMirror | 代码高亮显示 | 5.65.2 |

## 功能

### ✅ 已完成

* **基础语法支持**（Python 3.8）
  * 基础字面量：`1341 "Hi!" True None`
  * 标识符：`a _myVar h1 我是汉字`
  * 空表达式：`;`

* **网页界面**
  * 实时代码编辑
  * 语法高亮显示
  * 运行结果输出（目前尚未完工，所以只能看到词法分析和语法分析结果）
  * 错误信息提示

### 🔄 开发中
* 缩进与代码块
* 解释执行器
* 其他语法

## 项目结构
```text
js-python-interpreter/
├── index.html              # 主界面
├── main.js                 # 应用控制器
├── src/                    # 核心源码
│   ├── lexer.js            # 词法分析器
│   ├── parser.js           # 语法分析器
│   ├── token.js            # token和token类型
│   ├── token_patterns.js   # token匹配模板
│   ├── location.js         # 位置信息
│   ├── ast_nodes.js        # AST节点
│   ├── errors.js           # 异常
│   ├── literal_to_internal.js  # 解析字面量原始字符串为内部值
│   ├── indent_manager.js   # 缩进处理器（词法分析专用）
│   ├── source_context.js   # Python源码管理器
├── styles/                 # 页面样式
├── docs/                   # 文档与截图
├── README.md               # 项目说明
```

## 贡献

* **报告Bug**：在[Issues页面](https://github.com/QuickPie/js-python-interpreter/issues/)提交问题
* **建议功能**：告诉我缺少或你希望支持什么Python特性
* **改进代码**：Fork项目，修改后提交Pull Request

感谢您的贡献！

## 作者
**QuickPie** - 六年级学生开发者

### 关于项目
这是我自学JavaScript的实践项目。希望通过实现一个Python解释器来深入理解编程语言的底层原理。

### 关于我
* **编程经验**：1年Python、4年C++学习
* **当前兴趣**：JavaScript、编译原理、Web开发

### 联系我
* **GitHub**：[@QuickPie](https://github.com/QuickPie/)
* **问题反馈**：请通过GitHub Issues
* 欢迎交流和提供建议！

## 许可证
本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**⭐ 如果这个项目对你有帮助，请点个Star支持一下！ ⭐**
