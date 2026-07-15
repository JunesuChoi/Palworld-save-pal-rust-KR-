import json
import os

path = r"c:\palworld_server\palworld-save-pal-rust\data\json\ui\ko.json"

if not os.path.exists(path):
    print(f"Error: ko.json not found at {path}")
    exit(1)

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Optimized translation dictionary
replacements = {
    "accessory": "장신구",
    "actions": "작업",
    "active": "활성화",
    "add": "추가",
    "clear": "지우기",
    "confirm": "확인",
    "create": "생성",
    "edit": "편집",
    "egg": "알",
    "empty": "비어 있음",
    "export": "내보내기",
    "feed": "먹이 주기",
    "fill": "채우기",
    "guild": "길드",
    "health": "체력",
    "import": "가져오기",
    "inventory": "인벤토리",
    "level": "레벨",
    "move": "이동",
    "nickname": "닉네임",
    "normal": "일반",
    "passive": "패시브",
    "paste": "붙여넣기",
    "progress": "진행 상황",
    "rare": "희귀",
    "remove": "제거",
    "reset": "초기화",
    "search": "검색",
    "select": "선택",
    "selected": "선택됨",
    "sort": "정렬",
    "souls": "소울",
    "support": "지원",
    "tag": "태그",
    "type": "타입",
}

updated = 0
for key, new_val in replacements.items():
    if key in data:
        # Check if it is a list of selectors (like plural matches)
        if isinstance(data[key], list):
            for item in data[key]:
                if "match" in item:
                    for m_key in item["match"]:
                        orig = item["match"][m_key]
                        # E.g. "동업 조합" -> "길드" or "꼬리표" -> "태그"
                        if orig == "동업 조합":
                            item["match"][m_key] = "길드"
                            updated += 1
                        elif orig == "꼬리표":
                            item["match"][m_key] = "태그"
                            updated += 1
                        elif orig == "단짝":
                            item["match"][m_key] = "팰"
                            updated += 1
                        elif orig == "친구들":
                            item["match"][m_key] = "팰들"
                            updated += 1
        else:
            old_val = data[key]
            if old_val != new_val:
                data[key] = new_val
                updated += 1

# Additional custom corrections for values containing target words
for key in list(data.keys()):
    if isinstance(data[key], str):
        val = data[key]
        # Replace occurrences of awkward words in complex sentences
        new_val = val
        new_val = new_val.replace("동업 조합", "길드")
        new_val = new_val.replace("꼬리표", "태그")
        new_val = new_val.replace("계란", "알")
        new_val = new_val.replace("반죽", "붙여넣기")
        new_val = new_val.replace("수입", "가져오기")
        new_val = new_val.replace("종범", "장신구")
        new_val = new_val.replace("사장", "보스")
        new_val = new_val.replace("수준", "레벨")
        new_val = new_val.replace("운이 좋은", "희귀")
        new_val = new_val.replace("단짝", "팰")
        new_val = new_val.replace("친구들", "팰들")
        if new_val != val:
            data[key] = new_val
            updated += 1

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Successfully optimized ko.json. Total fields updated: {updated}")
