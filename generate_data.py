import os
import json

def generate_js_data():
    print("=== Auto Car Data Generator ===")
    
    # 扫描 public/stock 文件夹
    base_path = os.path.join("public", "stock")
    if not os.path.exists(base_path):
        print("Error: public/stock folder not found!")
        return

    # 获取所有车款文件夹
    folders = [f for f in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, f))]
    folders.sort() # 按名称排序

    cars_data = []
    
    print(f"--> Found {len(folders)} car folders. Generating data...")

    for idx, folder_name in enumerate(folders):
        folder_path = os.path.join(base_path, folder_name)
        
        # 统计图片数量 (不包含 cover.jpg)
        valid_exts = ('.jpg', '.jpeg', '.png', '.webp')
        all_files = [f for f in os.listdir(folder_path) if f.lower().endswith(valid_exts)]
        
        # 计算 imageCount (排除 cover.jpg)
        # 逻辑：总数 - 1 (cover.jpg)，如果小于0则为0
        has_cover = any(f.lower() == 'cover.jpg' for f in all_files)
        count = len(all_files) - 1 if has_cover else len(all_files)
        if count < 0: count = 0

        # 生成车辆对象模板
        car = {
            "id": idx + 1,
            "folderName": folder_name,
            "imageCount": count,
            "title": folder_name, # 默认用文件夹名做标题
            "price": 0,           # 待填
            "mileage": 0,         # 待填
            "year": 2024,         # 待填
            "fuel": "Petrol",     # 待填
            "transmission": "Auto",
            "engine": "2.5L",
            "seats": 7,
            "color": "White",
            "location": "Homebush",
            "status": "In Stock",
            "description": "Please update this description in src/carsData.js",
            "features": []
        }
        cars_data.append(car)
        print(f"   [+] Processed: {folder_name} ({count} images)")

    # 生成 JS 文件内容
    js_content = "export const cars = " + json.dumps(cars_data, indent=2) + ";"

    # 写入 src/carsData.js
    output_path = os.path.join("src", "carsData.js")
    
    # 简单的防止覆盖检查 (如果需要保留价格，可以先不覆盖，或者手动合并)
    if os.path.exists(output_path):
        print("\n⚠️  Warning: src/carsData.js already exists!")
        choice = input("Overwrite it? All manual prices/descriptions will be lost! (y/n): ")
        if choice.lower() != 'y':
            print("Aborted.")
            return

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"\n✅ Success! Data generated at: {output_path}")
    print("Now go to App.jsx and import this data!")

if __name__ == "__main__":
    generate_js_data()