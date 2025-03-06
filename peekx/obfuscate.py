import json
import base64
import os

# 输入和输出文件路径
input_file = 'data/corpus.json'         # 原始语料库文件
output_file = 'data/obfuscated_corpus.json'  # 混淆后的文件

# 确保 data 目录存在
os.makedirs('data', exist_ok=True)

# 读取原始 JSON 文件
try:
    with open(input_file, 'r', encoding='utf-8') as f:
        corpus = json.load(f)
except FileNotFoundError:
    print(f"错误：找不到 {input_file} 文件，请确保文件存在！")
    exit(1)
except json.JSONDecodeError:
    print(f"错误：{input_file} 文件格式无效，请检查 JSON 语法！")
    exit(1)

# 将 JSON 数据转换为字符串
corpus_str = json.dumps(corpus, ensure_ascii=False)

# 转换为 Base64 编码
obfuscated = base64.b64encode(corpus_str.encode('utf-8')).decode('utf-8')

# 保存到新文件
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(obfuscated)

print(f"混淆文件已生成：{output_file}")