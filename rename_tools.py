import os

def auto_batch_rename_all():
    print("\n=== 全自动图片整理工具 (Auto Batch Renamer) ===")
    print("功能：一次性整理 public/stock 下的所有文件夹")
    print("规则：保留 cover.jpg，其余重命名为 1.jpg, 2.jpg...\n")
    
    base_path = os.path.join("public", "stock")
    
    if not os.path.exists(base_path):
        print(f"❌ 错误：找不到文件夹: {base_path}")
        return

    # 获取所有子文件夹
    try:
        subfolders = [f for f in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, f))]
    except Exception as e:
        print(f"❌ 读取目录失败: {e}")
        return

    if not subfolders:
        print(f"⚠️ {base_path} 是空的！")
        return

    print(f"--> 扫描到 {len(subfolders)} 个车款文件夹，开始处理...\n")

    # 遍历所有文件夹
    for folder_name in subfolders:
        target_folder = os.path.join(base_path, folder_name)
        print(f"📂 正在处理: {folder_name}")

        # 1. 获取图片
        valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
        all_files = [f for f in os.listdir(target_folder) if f.lower().endswith(valid_extensions)]
        
        if not all_files:
            print("   ⚠️ 跳过：空文件夹")
            continue

        # 2. 分离封面和其他图片
        files_to_process = []
        has_cover = False
        
        for f in all_files:
            if f.lower() == 'cover.jpg':
                has_cover = True
            else:
                files_to_process.append(f)
        
        # 3. 检查是否需要重命名
        # 如果所有文件已经是数字命名 (1.jpg, 2.jpg...)，则跳过，避免重复操作打乱顺序
        is_already_clean = True
        for f in files_to_process:
            name_part = os.path.splitext(f)[0]
            if not name_part.isdigit():
                is_already_clean = False
                break
        
        if is_already_clean and len(files_to_process) > 0:
            print(f"   ✅ 跳过：图片看起来已经整理过了 ({len(files_to_process)} 张)")
            continue

        if not has_cover:
            print("   ⚠️ 警告：没找到 cover.jpg！(建议手动指定一张封面)")
            # 这里不中断，继续整理其他的

        # 4. 开始重命名逻辑
        # 先按文件名排序，保证顺序一致
        files_to_process.sort()

        # Step A: 先全部重命名为临时文件 (temp_xxx) 防止冲突
        for i, filename in enumerate(files_to_process):
            old_path = os.path.join(target_folder, filename)
            temp_name = f"temp_{i}_{filename}"
            temp_path = os.path.join(target_folder, temp_name)
            try:
                os.rename(old_path, temp_path)
            except OSError as e:
                print(f"   ❌ 重命名失败: {e}")

        # Step B: 从临时文件重命名为最终数字 (1.jpg, 2.jpg...)
        temp_files = [f for f in os.listdir(target_folder) if f.startswith("temp_")]
        # 按中间的数字索引排序，保证顺序不乱
        temp_files.sort(key=lambda x: int(x.split('_')[1]))

        for i, filename in enumerate(temp_files):
            old_path = os.path.join(target_folder, filename)
            new_name = f"{i + 1}.jpg" # 统一转为 .jpg
            new_path = os.path.join(target_folder, new_name)
            os.rename(old_path, new_path)

        print(f"   ✨ 完成！整理了 {len(temp_files)} 张图片")

    print("\n🎉 全部处理完毕！")
    print("👉 下一步：请运行 'python generate_data.py' 来更新网站数据。")

if __name__ == "__main__":
    auto_batch_rename_all()