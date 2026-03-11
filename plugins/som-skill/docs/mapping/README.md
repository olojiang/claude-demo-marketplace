# 映射关系文件

本目录包含各类映射关系的紧凑文件，便于 Claude Code 直接读取和快速查找。

> **重要提示**: 当需要查找映射关系时，请使用 **READ 工具**直接读取本目录下的文件，不要使用其他工具函数。这些文件采用紧凑格式，占用最小上下文空间，可以直接通过 READ 工具高效查找。

## 文件说明

### `space_enclosure_mapping.md`

- **格式**: 简洁的文本列表
- **用途**: Claude Code 直接读取，快速查找空间名称与 enclosureId 的映射关系
- **格式**: `空间名称 -> enclosureId`
- **特点**:
  - 紧凑格式，占用最小上下文空间
  - 按名称排序，便于搜索
  - 直接可读，无需解析脚本

### `name_class_mapping.md`

- **格式**: 简洁的文本列表
- **用途**: Claude Code 直接读取，快速查找 Class 中文名与 class.name 的映射关系
- **格式**: `中文名 -> class.name`
- **特点**:
  - 紧凑格式，占用最小上下文空间
  - 按中文名排序，便于搜索
  - 直接可读，无需解析脚本

## 使用方式

### ⚠️ 重要：必须使用 READ 工具

**查找映射关系时，必须使用 `read_file` 工具，不要使用其他工具函数**：

- ✅ **正确做法**: 使用 `read_file` 工具读取映射文件，然后在返回的内容中搜索
- ❌ **错误做法**: 使用 `grep`、`codebase_search`、`MAX` 等其他工具函数

**原因**: 这些映射文件已经过优化，采用紧凑格式，占用最小上下文空间。直接使用 `read_file` 读取即可高效查找，无需其他工具。

### 对于 Claude Code 模型

#### 空间映射查找 (`space_enclosure_mapping.md`)

**操作步骤**：

1. 使用 `read_file` 工具读取 `docs/mapping/space_enclosure_mapping.md`
2. 在返回的文件内容中搜索关键词（空间名称或 enclosureId）
3. 找到对应的映射关系

**使用场景**：

1. **按名称查找ID**: 用户提到空间名称时，读取文件并在内容中搜索找到对应的 enclosureId
2. **按ID查找名称**: 用户提供 enclosureId 时，读取文件并在内容中搜索找到对应的空间名称
3. **验证空间存在**: 检查某个空间名称或ID是否存在于系统中

**使用示例**:

- 用户询问"智源大厦的enclosureId是什么？"
  - 步骤：`read_file("docs/mapping/space_enclosure_mapping.md")` → 在内容中搜索"智源大厦" → 找到 `智源大厦 -> 30latS7FRxjUjk9FgbMwhZ`
- 用户提供enclosureId `3gGHgg1YEP8Eln8K0htraa`
  - 步骤：`read_file("docs/mapping/space_enclosure_mapping.md")` → 在内容中搜索该ID → 找到 `上海东方枢纽 -> 3gGHgg1YEP8Eln8K0htraa`

#### Class 名称映射查找 (`name_class_mapping.md`)

**操作步骤**：

1. 使用 `read_file` 工具读取 `docs/mapping/name_class_mapping.md`
2. 在返回的文件内容中搜索关键词（中文名或 class.name）
3. 找到对应的映射关系

**使用场景**：

1. **按中文名查找class.name**: 用户提到 Class 中文名时，读取文件并在内容中搜索找到对应的 class.name
2. **按class.name查找中文名**: 用户提供 class.name 时，读取文件并在内容中搜索找到对应的中文名
3. **验证Class存在**: 检查某个 Class 是否存在于系统中

**使用示例**:

- 用户询问"房间的class名称是什么？"
  - 步骤：`read_file("docs/mapping/name_class_mapping.md")` → 在内容中搜索"房间" → 找到 `房间 -> space.room`
- 用户提供class.name `thing.device.camera`
  - 步骤：`read_file("docs/mapping/name_class_mapping.md")` → 在内容中搜索该名称 → 找到 `摄像头 -> thing.device.camera`

## 数据来源

映射数据来自 `temp/space_enclosure_mapping.md` 和 `temp/name_class_mapping.md` 原始数据。

## 统计信息

- **总空间数**: 272
- **有名称的空间**: 268
- **未命名空间**: 4
