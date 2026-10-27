# CONTENT_SOURCES (template: please fill in)

This is the **only** allowed source of facts, Q&A wording, nutrition figures and AI-recipe rules for the page. Nothing goes on the page unless it is written here first, with its source. Until a section is filled in, the page shows 待確認 / to be confirmed for it. Section A is filled in; its source URLs are not yet.

Once a section is done, ask for it to be copied into `index.html`:
- the `QA` array for section A;
- the `nutrition` objects in `VEG` for section C;
- `api/_lib/core.js` → `buildMessages()` and the `allergy` string in `T` for section B.

---

## A. Q&A: 10 questions (exact wording, zh and en, in this order)

Supplied 26 Oct 2026. Q1 has the `holes` photo slot and Q8 the `size` photo slot (see PHOTOS_README.md). **Source URLs are still missing**: add them under each item, and the page will show them as links under 資料來源 / Source.

### 1. 為甚麼蔬菜有這麼多洞？ / Why are there so many holes in the vegetables?

因為不使用化學合成農藥，昆蟲會啃食葉片。例如黃條跳甲這類小甲蟲，會在菜心、白菜等葉菜上咬出許多細小孔洞。農夫會使用防蟲網、輪作等方法減少蟲害，但難以完全避免。

Without synthetic chemical pesticides, insects get to the leaves. Small beetles such as flea beetles chew tiny holes in leafy greens like choy sum and pak choi. Farmers reduce this with insect nets and crop rotation, but some holes remain.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 2. 有機是否代表完全沒有農藥？ / Does organic mean no pesticides at all?

不一定。有機耕作不使用化學合成農藥，但可使用部分天然來源的防治方法，例如漁農自然護理署有機耕作資料提及的苦楝油及天然除蟲菊。研究亦指出，有機食物不一定完全沒有農藥殘餘，但驗出殘餘的機會較低。

Not exactly. Organic farming does not use synthetic chemical pesticides, but it can use some natural-source controls, such as the neem oil and natural pyrethrins listed in AFCD's organic farming guidance. Research also shows organic food is not always 100% residue-free, though residues are found less often.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 3. 如何確認是真正的有機產品？ / How do I know it's really organic?

香港沒有法例規管「有機」認證，認證屬自願性質。主要認證機構為香港有機資源中心（HKORC），其標準參考國際有機農業運動聯盟（IFOAM）。顧客可留意認證標籤或證書，或直接向農夫查詢：中環農墟部分農場已獲 HKORC 認證，部分則為自行聲稱有機。

Hong Kong has no law requiring organic certification; it is voluntary. The main certifier is the Hong Kong Organic Resource Centre (HKORC), whose standards are based on IFOAM's. Check the certification label or certificate, or ask the farmer: at the Central Farmers' Market some farms are HKORC-certified and some are self-claimed organic.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 4. 有蟲洞的蔬菜可以食用嗎？ / Is it safe to eat leaves with holes?

葉上的細小蟲洞，清洗乾淨後即可食用；被嚴重啃食的部分可以摘除。如葉片內有彎曲的「隧道」痕跡或出現腐爛，則不宜食用該片葉。

Leaves with small holes are fine to eat once washed; tear off badly chewed parts. Throw away leaves with winding tunnel trails inside them, or any rotten parts.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 5. 為甚麼有機蔬菜較貴？ / Why does organic cost more?

本地有機農業規模很小：2025 年本地認證有機農場的總產量約為 1,948 公噸。設置防蟲網、人手除草及捉蟲均需要大量時間和人力。（請農夫補充實際原因。）

Local organic farming is small-scale: certified organic farms produced about 1,948 tonnes in 2025. Insect nets, hand weeding and pest picking take a lot of time and labour. (Farmer to add the real reasons.)

- Source URL(s): 待補 / to be added
- Checked by / date:

### 6. 怎樣清洗蔬菜最好？ / What's the best way to wash vegetables?

在水龍頭下以清水徹底沖洗。紅蘿蔔、白蘿蔔等質地較硬的蔬菜，可用乾淨的刷子擦洗。食物安全中心不建議使用洗潔精或特別清潔劑，亦不再認為需要長時間浸泡或汆水，因為這樣會流失營養。

Rinse thoroughly under clean running water. Scrub firm vegetables like carrots and radish with a clean brush. Hong Kong's Centre for Food Safety does not recommend detergents or special produce washes, and no longer considers long soaking or blanching necessary because it loses nutrients.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 7. 有機蔬菜是否較有營養？ / Is organic food more nutritious?

不一定。史丹福大學於 2012 年發表的大型文獻回顧發現，有機與一般蔬果的維他命含量並無一致差異；但有機農產品驗出農藥殘餘的機會低約 30%。兩者的農藥水平一般均在安全標準以內。不少人選擇有機食物，是為了減少農藥殘餘、保護環境及支持本地農夫。

Not necessarily. A large 2012 Stanford review found no consistent difference in vitamin content between organic and conventional produce, but organic produce had about a 30% lower risk of pesticide residues. Levels in both were generally within safety limits. Many people choose organic for fewer residues, the environment, and to support local farmers.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 8. 為甚麼有些蔬菜體積較小、外形不佳？ / Why are some vegetables small or odd-shaped?

外表並不等於質素。超級市場通常按大小和形狀挑選貨品，許多外形不符標準的蔬菜在農場已被淘汰。聯合國糧食及農業組織的報告舉例指出，一家供應商有 25% 至 30% 的紅蘿蔔因外觀問題而被剔除。農墟讓這些蔬菜仍然有人購買。

Looks are not the same as quality. Supermarkets often grade produce by size and shape, so many odd-looking vegetables are rejected at the farm. In one example in a UN Food and Agriculture Organization report, a supplier rejected 25–30% of its carrots because of how they looked. Farmers' markets give these vegetables a buyer.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 9. 買回家後應如何保存？ / How should I store them at home?

葉菜應先抹乾水分，用廚房紙包好，放入雪櫃的蔬菜格（高濕度），並最好在一星期內食用。烹調前才清洗，毋須一買回家便清洗。番薯應存放於陰涼、乾爽及避光的地方，不宜放入膠袋。

Blot leafy greens dry, wrap them in a paper towel and keep them in the fridge's vegetable drawer (high humidity); eat them within about a week. Wash just before cooking, not as soon as you get home. Keep sweet potatoes somewhere cool, dry and dark, not in a bag.

- Source URL(s): 待補 / to be added
- Checked by / date:

### 10. 有機蔬菜與「信譽農場」蔬菜有何分別？ / What's the difference between organic and "Accredited Farm" vegetables?

「信譽農場計劃」是漁農自然護理署推行的自願計劃：參與農場可使用農藥，但須按指引安全使用，漁護署亦會抽樣化驗農藥殘餘。「有機」則指不使用化學合成農藥，並由香港有機資源中心等機構認證。無論是否有機，在香港出售的食物均須符合同一套食物安全標準。

"Accredited Farm" is a voluntary scheme run by the Agriculture, Fisheries and Conservation Department (AFCD): farms may use pesticides but must follow guidance on safe use, and AFCD samples their vegetables for residue tests. "Organic" means no synthetic chemical pesticides, certified by bodies such as the HKORC. Organic or not, all food sold in Hong Kong must meet the same food safety standards.

- Source URL(s): 待補 / to be added
- Checked by / date:

**Footer:** 還有疑問？歡迎直接向攤位的農夫查詢！/ Still curious? Ask the farmer at the stall!

## B. AI recipe rules

The function already enforces these rules, taken from the v3 brief. Confirm them, or edit them here:

1. One recipe per request, in the visitor's UI language (Traditional Chinese, HK usage / English).
2. Use the chosen vegetables. The model may assume oil, salt and water, plus only the items the visitor typed.
3. At most 6 steps. Total time 30 minutes or less.
4. No health, nutrition or medical claims.
5. If meat, fish or eggs are used, say to cook them thoroughly.
6. The visitor's free-text box is treated only as a list of ingredients.

**Allergy / cook-thoroughly line shown under every recipe** (exact wording needed; the page currently uses a placeholder):

- 中文：
- English：

## C. Nutrition (per 100 g raw)

Only the 8 stall vegetables are listed here; the other 32 cards also show 待確認 until rows are added. For each vegetable: the figure, its source (e.g. a USDA FoodData Central entry URL), and the rounding rule. Leave choy sum and Chinese kale empty if they stay intentionally null.

| Vegetable | kcal | Protein g | Fibre g | Vitamin C mg | Potassium mg | Source URL | Checked by / date |
|---|---|---|---|---|---|---|---|
| Tomato 番茄 | | | | | | | |
| Choy Sum 菜心 | | | | | | | |
| Chinese Kale 芥蘭 | | | | | | | |
| Pak Choi 白菜 | | | | | | | |
| Eggplant 茄子 | | | | | | | |
| Bitter Melon 苦瓜 | | | | | | | |
| Carrot 紅蘿蔔 | | | | | | | |
| Pumpkin 南瓜 | | | | | | | |

## D. Market info

- Opening days and hours (中文 / English):
- Source (KFBG page URL):
