# Claude 模板资源分析：获取实体 API 接口

## 分析场景

当用户请求"获取实体 API 接口"时，Claude 会使用哪些"内功"（资源）？

---

## 一、核心资源（必定使用）

### 1. **系统提示词** (`.claude/system-prompt.md`)

**作用**：定义 Claude 的身份和行为规范

**关键内容**：

- 身份：松松，来自奇岱松公司
- 核心专长：SOM（空间对象模型）系统开发
- 文档规范：优先使用中文，详细展示 API 调用过程
- 设计原则：KISS、YAGNI、快速失败

**影响**：

- Claude 会以"松松"的身份回复
- 会使用中文进行交流
- 会详细展示 API 调用过程

### 2. **实体 API 文档** (`docs/openapi/entity.md`)

**作用**：提供实体 API 的完整技术文档

**关键内容**：

- API 基础路径：`https://test.sheepwall.com/som`
- 主要接口：
  - `GET /api/getEntity/{uuid}` - 读取实体
  - `POST /api/createEntity` - 创建实体
  - `POST /api/upsertEntity` - 创建或更新实体
  - `PATCH /api/updateEntity` - 部分更新实体
  - `DELETE /api/deleteEntity` - 删除实体
- 请求参数格式
- 响应格式示例

**影响**：

- Claude 会参考此文档生成准确的 API 调用代码
- 会使用正确的参数格式和 URL 结构

### 3. **环境变量** (`.claude/settings.json`)

**作用**：提供 API 调用所需的环境变量

**关键变量**：

- `ENCLOSURE_ID`: `2fb22820cd654d2a9ba308b930ff3544` - 空间 UUID
- `DEVICE_MAC`: `a02833805ca1` - 设备 MAC（可能用于相关查询）

**影响**：

- Claude 会隐式使用这些环境变量
- 在生成代码时自动替换 `{ENCLOSURE_ID}` 占位符
- 不会在对话中暴露具体的环境变量值

### 4. **API 调用响应协议** (`CLAUDE.md` 第 49-55 行)

**作用**：定义 API 调用后的输出格式规范

**要求**：

1. **📋 请求详情**: 完整的 cURL 命令字符串（URL 编码格式）
2. **📊 响应结果**: 格式化后的 JSON 响应数据
3. **💻 代码示例**: 对应的 JavaScript/Axios 调用代码

**影响**：

- Claude 会按照此协议展示 API 调用结果
- 会提供完整的 cURL 命令和 JavaScript 代码示例

### 5. **JavaScript 代码规范** (`.claude/output-styles/javascript-strict.md`)

**作用**：定义 JavaScript 代码生成的严格规范

**关键规范**：

- 使用 react-syntax-highlighter 行高亮语法
- 2 个空格缩进
- 单引号字符串
- 强制分号
- 行宽不超过 80 字符
- Axios 使用规范和错误处理

**影响**：

- 生成的 JavaScript 代码会遵循这些规范
- 代码会包含行号高亮，突出核心逻辑
- 会包含完整的错误处理

---

## 二、辅助资源（可能使用）

### 6. **person-detector 技能** (`.claude/skills/person-detector/SKILL.md`)

**作用**：提供 API 调用的最佳实践模式

**可能的使用场景**：

- 虽然主要针对人员检测，但提供了通用的 API 调用模式
- 可以参考其参数格式、错误处理方式
- 可以参考环境变量的隐式获取方式

**影响**：

- 如果实体 API 调用模式类似，Claude 可能会参考此技能的模式
- 会使用类似的错误处理和响应验证方式

### 7. **代码库搜索** (`settings.json` 中 `codebase_search: true`)

**作用**：允许 Claude 搜索代码库中的相关代码

**可能的使用场景**：

- 搜索项目中已有的实体 API 调用示例
- 查找相关的工具函数或封装
- 了解项目的代码风格

**影响**：

- Claude 可能会搜索代码库，查找相关示例
- 会参考项目中已有的代码风格

### 8. **网络访问权限** (`settings.json` 中 `web_access: true`)

**作用**：允许 Claude 访问网络资源

**可能的使用场景**：

- 如果需要验证 API 文档的最新版本
- 如果需要查找相关的技术文档

**影响**：

- Claude 可以访问外部资源获取额外信息

### 9. **Bash 命令权限** (`settings.json` 中 `permissions.allow`)

**作用**：允许执行特定的 Bash 命令

**可能的使用场景**：

- 执行 `curl` 命令测试 API
- 使用 `python` 脚本处理数据

**影响**：

- Claude 可以执行 curl 命令来实际测试 API
- 可以运行脚本进行数据处理

---

## 三、输出样式配置

### 10. **输出样式** (`settings.json` 中 `output-style: "explanatory"`)

**作用**：控制 Claude 的输出风格

**影响**：

- Claude 会提供详细的解释性输出
- 会解释 API 调用的每个步骤
- 会提供背景信息和最佳实践建议

---

## 四、实际调用流程分析

当用户请求"获取实体 API 接口"时，Claude 的典型流程：

### 第一步：理解需求

- 读取 `system-prompt.md`，确定身份和专长
- 理解用户需要的是实体 API 接口调用

### 第二步：查找文档

- 读取 `docs/openapi/entity.md` 获取 API 文档
- 可能搜索代码库查找相关示例
- 参考 `person-detector` 技能的 API 调用模式

### 第三步：生成代码

- 使用 `javascript-strict.md` 规范生成代码
- 隐式获取 `ENCLOSURE_ID` 环境变量
- 生成符合规范的 JavaScript/Axios 代码
- 使用行号高亮标记核心代码

### 第四步：执行测试（可选）

- 使用 curl 命令测试 API
- 验证响应格式

### 第五步：格式化输出

- 按照 API 调用响应协议展示：
  1. 完整的 cURL 命令
  2. 格式化的 JSON 响应
  3. JavaScript/Axios 代码示例（带行号高亮）

---

## 五、资源优先级

### 高优先级（必定使用）

1. ✅ `system-prompt.md` - 身份和行为规范
2. ✅ `docs/openapi/entity.md` - API 技术文档
3. ✅ `settings.json` - 环境变量和权限
4. ✅ `CLAUDE.md` - API 调用响应协议
5. ✅ `javascript-strict.md` - 代码格式规范

### 中优先级（很可能使用）

6. ⚠️ `person-detector/SKILL.md` - API 调用模式参考
7. ⚠️ 代码库搜索 - 查找相关示例

### 低优先级（可能使用）

8. ⚠️ 网络访问 - 获取额外信息
9. ⚠️ Bash 命令 - 测试 API

---

## 六、关键发现

### 1. **没有专门的实体 API 技能**

- 目前只有 `person-detector` 技能
- 实体 API 调用主要依赖 `entity.md` 文档
- **建议**：可以考虑创建 `entity-api` 技能，封装实体 API 调用的最佳实践

### 2. **环境变量隐式使用**

- `ENCLOSURE_ID` 会自动从 `settings.json` 获取
- 不会在对话中暴露具体值
- 代码中会使用占位符或环境变量引用

### 3. **输出格式严格规范**

- 必须包含 cURL、JSON 响应、JavaScript 代码
- JavaScript 代码必须符合 `javascript-strict.md` 规范
- 必须使用行号高亮标记核心代码

### 4. **代码风格统一**

- 所有 JavaScript 代码遵循统一规范
- 包含完整的错误处理
- 使用 Axios 进行 HTTP 请求

---

## 七、优化建议

### 1. 创建实体 API 技能

在 `.claude/skills/` 下创建 `entity-api/` 技能，包含：

- 实体 API 调用的最佳实践
- 常见场景的代码示例
- 错误处理模式
- 响应数据验证

### 2. 添加实体 API 示例

在 `docs/openapi/` 或技能目录下添加：

- 完整的调用示例
- 不同场景的使用案例
- 常见错误的处理方式

### 3. 完善环境变量说明

在 `CLAUDE.md` 中明确说明：

- 哪些环境变量用于实体 API
- 如何隐式获取和使用
- 占位符的替换规则

---

## 总结

当 Claude 需要获取实体 API 接口时，**最核心的资源**是：

1. **`docs/openapi/entity.md`** - 提供 API 技术规范
2. **`system-prompt.md`** - 定义回复风格和身份
3. **`javascript-strict.md`** - 规范代码格式
4. **`settings.json`** - 提供环境变量和权限
5. **`CLAUDE.md`** - 定义输出格式协议

这些资源共同作用，确保 Claude 能够：

- 生成准确的 API 调用代码
- 遵循项目的代码规范
- 提供完整的调用示例
- 使用正确的环境变量
- 按照协议格式化输出
