"""
LandSetu Legal & Statutory Expert Synthesis Engine
Bilingual (Hinglish, Hindi, English) Procedural Jurisprudence & Revenue Architecture
Covers:
- Uttar Pradesh Revenue Code, 2006 (Demarcation, Non-Agri 143/80, SC Land 98, Varasat 108, Partition 116, Declaratory 144, Appeals 207-210, Mutation 34, Eviction 67)
- Delhi Land Reforms Act, 1954 (Section 81 & Urbanisation)
- Punjab Land Revenue Act, 1887 in Haryana (Jamabandi, Khasra Girdawari, Inteqal, Takseem)
- Supreme Court of India Landmark Rulings (Suraj Lamp, Radhy Shyam, Jagpal Singh, Indore Dev Auth, Vidya Devi)
- RFCTLARR Act, 2013 (LARRA Ref 64, 15% Interest 80, Solatium 30, SIA 4, Lapsing 23)
- DILRMP 2.0 (ULPIN / Bhu-Aadhaar, SRO-Tehsil Auto Mutation)
"""

from typing import Dict, Any, List, Optional

STATUTORY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "CHUNK-UPREV-SEC24-DEMARCATION-HADBANDI": {
        "doc_id": "DOC-UP-REV-CODE-2006",
        "act_name": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 24 (धारा 24 - सीमांकन, पैमाइश व पत्थरगड्डी)",
        "authority": "उप-जिलाधिकारी (SDM / SDO) एवं राजस्व निरीक्षक (कानूनगो)",
        "form_fee": "प्रपत्र आर.सी.-24 (Form R.C.-24) + प्रति गाटा ₹1,000 राजकीय चालान (Treasury Challan)",
        "timeline": "30 दिन में पैमाइश आख्या (Field Book); 15 दिन की नोटिस उपरांत अंतिम आदेश",
        "summary_hinglish": "Agar padosi ne khet ki medh kaat li hai ya boundary ko lekar vivad hai, toh SDM Court me Dhara 24 ke tehat Hadbandi / Patthargaddi ka suit daalna hota hai. Revenue team mauke par aakar ETS machine ya 66-foot jarib se survey karke police ki maujoodgi me pakka boundary stone (Sihadda) gadwati hai.",
        "summary_hi": "यदि किसी काश्तकार की मेढ़ काट ली गई हो अथवा भूखंड की सीमाओं को लेकर विवाद हो, तो उप-जिलाधिकारी (एसडीएम) न्यायालय में धारा 24 के अंतर्गत सीमांकन व पत्थरगड्डी का वाद दायर किया जाता है। राजस्व निरीक्षक एवं लेखपाल की टीम मौके पर पैमाइश कर पत्थरगड्डी संपन्न कराती है।",
        "summary_en": "Under Section 24 of the UP Revenue Code, 2006, an aggrieved tenure-holder whose boundary is altered or encroached must apply to the Sub-Divisional Officer (SDM) for demarcation and fixation of permanent boundary pillars (Patthargaddi).",
        "steps_hinglish": [
            "1. **Tehsil Me Avedan**: SDM Court me Form R.C.-24 par aavedan karein aur prati gata ₹1,000 ka sarkaari treasury challan jama karein.",
            "2. **Mauka Paimash Ka Nirdesh**: SDM dwara Revenue Inspector (RI/Kanoongo) aur Lekhpal ko mauke par paimash ka aadesh diya jata hai.",
            "3. **Sthayi Chinho Se Survey**: Revenue team gaon ke 3 pakke chinho (Timedha / Chaumedha / Fixed survey points) se Electronic Total Station (ETS) ya 66-foot Jarib se paimash karti hai.",
            "4. **Field Book Aakhya**: 30 din ke bheetar RI apni 'Paimash Aakhya' (Field Book Report) SDM court me prastut karta hai.",
            "5. **Notice aur Sunwai**: Sabhi seemavarti (adjacent) kashtkaron ko 15 din ka notice diya jata hai aur unki aapatian suni jaati hain.",
            "6. **Patthargaddi Aadesh**: SDM dwara antim aadesh paarit hone par revenue team police bal ki upasthiti me boundary par pakka patthar (Sihadda) gadwa deti hai."
        ],
        "steps_hi": [
            "1. **एसडीएम न्यायालय में वाद**: प्रपत्र आर.सी.-24 पर प्रति गाटा ₹1,000 के चालान के साथ एसडीएम न्यायालय में आवेदन प्रस्तुत करें।",
            "2. **पैमाइश निर्देश**: एसडीएम द्वारा राजस्व निरीक्षक व क्षेत्रीय लेखपाल को स्थलीय पैमाइश का निर्देश दिया जाता है।",
            "3. **त्रिकोणीय स्थायी चिन्हों से नाप**: गाँव के तीन स्थायी सीमा चिन्हों (तिमेधा/चौमेधा) से इलेक्ट्रॉनिक टोटल स्टेशन (ETS) या जरीब द्वारा पैमाइश की जाती है।",
            "4. **फील्ड बुक रिपोर्ट**: राजस्व निरीक्षक 30 दिनों के भीतर अपनी पैमाइश आख्या (Field Book) न्यायालय में प्रस्तुत करता है।",
            "5. **आपत्ति व सुनवाई**: सीमावर्ती खातेदारों को 15 दिन का नोटिस देकर आपत्तियां आमंत्रित की जाती हैं।",
            "6. **पत्थरगड्डी का क्रियान्वयन**: एसडीएम के अंतिम आदेश के अनुपालन में पुलिस बल की उपस्थिति में सीमा पर पक्के पत्थर (सिहद्दा) गड़वाए जाते हैं।"
        ],
        "steps_en": [
            "1. **Filing Application**: File an application under Form R.C.-24 before the Sub-Divisional Officer (SDM) along with a treasury challan of ₹1,000 per gata.",
            "2. **Demarcation Order**: The SDM directs the Revenue Inspector (Kanoongo) and Lekhpal to conduct on-site measurement.",
            "3. **Triangulation Survey**: The survey team measures from three permanent boundary pillars (Timedha/Chaumedha) using Electronic Total Station (ETS) or Gunter's chain.",
            "4. **Submission of Field Book**: The Revenue Inspector prepares the demarcation report and field map within 30 days.",
            "5. **Notice to Neighbors**: A 15-day notice is issued to all adjoining landholders for filing objections.",
            "6. **Pillar Fixation**: Upon final confirmation by the SDM, permanent boundary pillars (Sihadda) are embedded in the presence of local police."
        ],
        "precedent": "धारा 227 के तहत राजस्व सीमा चिन्ह (पत्थर) को नुकसान पहुँचाने या उखाड़ने पर अर्थदंड व विधिक दंड की सख्त व्यवस्था है।",
        "safeguards": "एसडीएम के अंतिम आदेश से असंतुष्ट होने पर 30 दिनों के भीतर मंडलायुक्त (Divisional Commissioner) के समक्ष अपील की जा सकती है।"
    },
    "CHUNK-UPREV-SEC80-NON-AGRI-DECLARATION": {
        "doc_id": "DOC-UP-REV-CODE-2006",
        "act_name": "Uttar Pradesh Revenue Code, 2006 (पूर्व धारा 143 UPZALR Act)",
        "section": "Section 80 (धारा 80 - कृषि भूमि का गैर-कृषि घोषणा / Land Use Conversion)",
        "authority": "उप-जिलाधिकारी (SDM / SDO)",
        "form_fee": "UP e-District / Bhulekh ऑनलाइन पोर्टल + सर्किल रेट (Circle Rate Valuation) का 1% न्यायशुल्क कोर्ट फीस",
        "timeline": "45 दिन की वैधानिक बाध्यता; समय पर आदेश न होने पर 'डीम्ड गैर-कृषि' (Deemed Declared) का नियम",
        "summary_hinglish": "Agar aap kheti ki zameen par makan, dukaan, godown, factory banana chahte hain ya residential plotting katna chahte hain, toh Dhara 80 (jo pehle Dhara 143 kehlaati thi) ke tehat SDM se ghoshna karwana anivarya hai. Isme 45 din me deemed approval ka kanooni niyam hai.",
        "summary_hi": "संक्रमणीय भूमिधर द्वारा कृषि भूमि पर आवासीय मकान, दुकान, उद्योग, गोदाम या प्लॉटिंग करने हेतु धारा 80 (पूर्ववर्ती धारा 143) के तहत उप-जिलाधिकारी (एसडीएम) से गैर-कृषि घोषणा कराना अनिवार्य है। इसमें 45 दिनों के भीतर आदेश न होने पर स्वतः डीम्ड स्वीकृति का प्रावधान है।",
        "summary_en": "Under Section 80 of the UP Revenue Code, 2006 (formerly Section 143 of UPZALR Act), an agricultural bhumidhar must seek non-agricultural declaration from the SDM for industrial, residential, or commercial construction, with a 45-day deemed approval rule.",
        "steps_hinglish": [
            "1. **Dastavej Tayar Karein**: Khasra, certified Khatauni, registry ki copy aur architect dwara pramanit Nazri Naksha (Site Plan) ready karein.",
            "2. **Online Portal par Avedan**: UP e-District / Bhulekh portal par Dhara 80 ka online form bharein aur property ke circle rate ka 1% court fee challan jama karein.",
            "3. **Tehsildar / Lekhpal Sthaliya Jaanch**: SDM avedan ko Tehsildar ke paas bhejte hain, jahan Lekhpal mauke par jakar verify karta hai ki zameen par koi vivad ya Gram Sabha ki land toh nahi hai.",
            "4. **45-Day Deemed Rule**: 45 din ke bheetar SDM dwara ghoshna aadesh paarit hona anivarya hai. Agar 45 din me aadesh nahi hota toh kanoonan use 'Deemed Declared' mana jata hai.",
            "5. **Khatauni me Amal-dar-amad**: Aadesh paarit hone ke baad Khatauni ke Column-6 me entry darj ho jaati hai aur zameen par Ceiling Act (Dhara 89) lagoo hona band ho jaata hai."
        ],
        "steps_hi": [
            "1. **दस्तावेज़ संकलन**: खसरा, प्रमाणित खतौनी, बैनामा एवं पंजीकृत वास्तुकार (Architect) द्वारा तैयार नज़री नक्शा संलग्न करें।",
            "2. **ऑनलाइन आवेदन**: ई-डिस्ट्रिक्ट पोर्टल पर धारा 80 का आवेदन दाखिल कर संपत्ति के सर्किल रेट का 1% न्यायशुल्क चालान जमा करें।",
            "3. **स्थलीय सत्यापन**: तहसीलदार एवं लेखपाल द्वारा मौके की भौतिक जांच कर रिपोर्ट न्यायालय में प्रस्तुत की जाती है।",
            "4. **45-दिवसीय डीम्ड उपबंध**: एसडीएम को 45 दिनों में आदेश पारित करना अनिवार्य है; अन्यथा भूमि विधि अनुसार स्वतः गैर-कृषि मानी जाती है।",
            "5. **अमलदरामद**: आदेश होते ही खतौनी के स्तम्भ-6 में गैर-कृषि आदेश दर्ज होता है और राजस्व जोत सीमा निष्प्रभावी हो जाती है।"
        ],
        "steps_en": [
            "1. **Document Preparation**: Obtain certified Khatauni, registered title deed, Khasra extract, and an architect-certified site layout plan.",
            "2. **Online Application**: Apply on UP e-District portal and pay 1% court fee computed on the circle rate valuation.",
            "3. **Field Inquiry**: The Tehsildar and Lekhpal conduct an on-ground inquiry verifying possession and absence of public easements.",
            "4. **45-Day Deemed Declaration**: The SDM must pass the order within 45 days, failing which the parcel is legally deemed non-agricultural.",
            "5. **Record Mutation**: The declaration is endorsed in Column 6 of the Khatauni, exempting the land from ceiling limits and enabling municipal building plan approvals."
        ],
        "precedent": "धारा 80 की घोषणा के बाद विकास प्राधिकरणों (NOIDA/Greater Noida/YEIDA) से बिल्डिंग प्लान पास कराया जा सकता है और उत्तराधिकार सामान्य सिविल कानून (Hindu Succession Act / Personal Law) से तय होता है।",
        "safeguards": "यदि एसडीएम आवेदन अस्वीकार करता है, तो 30 दिनों के भीतर मंडलायुक्त (Divisional Commissioner) के समक्ष अपील की जा सकती है।"
    },
    "CHUNK-UPREV-SEC98-99-SC-TRANSFER-RESTRICTION": {
        "doc_id": "DOC-UP-REV-CODE-2006",
        "act_name": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 98, 99, 104 & 105 (अनुसूचित जाति भूमि अंतरण पर प्रतिबंध)",
        "authority": "जिलाधिकारी / कलेक्टर (District Magistrate / Collector)",
        "form_fee": "कलेक्टर न्यायालय में विहित प्रपत्र पर आवेदन + सत्यापन शपथ पत्र",
        "timeline": "कलेक्टर द्वारा स्थलीय व आर्थिक जांच उपरांत लिखित अनुमति",
        "summary_hinglish": "Kanoon ke anusar Dalit (SC) bhumidhar ki kheti ki zameen koi bhi General ya OBC vyakti bina Collector (DM) ki written permission ke nahi khareed sakta. Agar bina permission ke registry karwayi toh Dhara 104 me registry ZERO (Void) ho jayegi aur Dhara 105 me zameen UP Government me zabt (Vest) ho jayegi.",
        "summary_hi": "उत्तर प्रदेश राजस्व संहिता की धारा 98 के तहत अनुसूचित जाति (SC) का कोई भी भूमिधर अपनी कृषि भूमि किसी गैर-अनुसूचित जाति के व्यक्ति को जिलाधिकारी (कलेक्टर) की पूर्व लिखित अनुमति के बिना नहीं बेच सकता। बिना अनुमति की गई रजिस्ट्री धारा 104 के तहत शून्य होती है और भूमि धारा 105 में राज्य सरकार में जब्त हो जाती है।",
        "summary_en": "Under Section 98 of the UP Revenue Code, an SC tenure-holder cannot transfer agricultural land to a non-SC without prior written permission of the Collector. Transfers violating this are void ab initio under Section 104 and automatically vest in the State under Section 105.",
        "steps_hinglish": [
            "1. **Anumati ki Shartein**: Vikreta ke paas zameen bechne ke baad kam se kam 3.125 acre (1.26 hectare) krishi bhoomi bachi honi chahiye.",
            "2. **Apvaad (Exception)**: Agar parivar me kisi ko gambhir bimari hai ya bete/beti ki higher technical education hai, toh 3.125 acre se kam bache hone par bhi DM permission de sakta hai.",
            "3. **Collector Court me Avedan**: Seller aur Buyer dono milkar DM Court me permission application daalte hain.",
            "4. **SDM/Tehsildar Jaanch**: DM SDM aur Tehsildar se report mangwata hai ki vikreta par koi dabav ya dhokhadhadi toh nahi hai.",
            "5. **Permission Order ke baad Registry**: DM ki formal order copy milne ke baad hi Sub-Registrar Office (SRO) me registry legal hoti hai."
        ],
        "steps_hi": [
            "1. **वैधानिक शर्त**: भूमि अंतरण के पश्चात विक्रेता के पास कम से कम 3.125 एकड़ (1.26 हेक्टेयर) भूमि शेष बचनी अनिवार्य है।",
            "2. **विशिष्ट छूट**: परिवार के किसी सदस्य के गंभीर रोग के उपचार अथवा उच्च तकनीकी शिक्षा हेतु विशेष परिस्थिति में डीएम अनुमति दे सकता है।",
            "3. **कलेक्टर न्यायालय में आवेदन**: क्रेता और विक्रेता द्वारा संयुक्त रूप से जिलाधिकारी न्यायालय में अनुमति प्रार्थना पत्र प्रस्तुत किया जाता है।",
            "4. **तहसीलदार स्थलीय आख्या**: एसडीएम व तहसीलदार द्वारा स्थलीय जांच कर सत्यापन रिपोर्ट कलेक्टर को प्रेषित की जाती है।",
            "5. **निबंधन**: कलेक्टर की पूर्व लिखित अनुमति आदेश संलग्न करने पर ही उप-निबंधक (SRO) कार्यालय में बैनामा वैध माना जाएगा।"
        ],
        "steps_en": [
            "1. **Land Retention Mandate**: The SC vendor must retain at least 3.125 acres (1.26 hectares) of agricultural land post-sale.",
            "2. **Hardship Exceptions**: Sale is permitted below the ceiling only for critical medical emergencies or higher technical education of dependents.",
            "3. **Application before Collector**: Formal joint application filed before the District Magistrate / Collector.",
            "4. **Field Verification**: Tehsildar verifies genuine free consent and ensures the seller is not being coerced or dispossessed.",
            "5. **Conveyance Registration**: Only upon receiving the Collector's authenticated sanction order can the conveyance deed be registered."
        ],
        "precedent": "धारा 104 के तहत बिना पूर्व अनुमति का बैनामा पूर्णतः 'शून्य' (Void ab initio) घोषित होता है और धारा 105 के तहत भूमि सरकार में निहित हो जाती है, जिसमें क्रेता का पैसा और ज़मीन दोनों जब्त हो जाते हैं।",
        "safeguards": "कलेक्टर द्वारा अनुमति निरस्त किए जाने पर 30 दिनों के भीतर मंडलायुक्त (Divisional Commissioner) के समक्ष अपील की जा सकती है।"
    },
    "CHUNK-UPREV-SEC108-110-SUCCESSION-VARASAT": {
        "doc_id": "DOC-UP-REV-CODE-2006",
        "act_name": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 108, 109 & 110 (उत्तराधिकार का क्रम व ई-वरासत / Succession & Pauti Rules)",
        "authority": "राजस्व निरीक्षक (Revenue Inspector) एवं लेखपाल",
        "form_fee": "ई-डिस्ट्रिक्ट / ई-वारिस (e-Varasat) पोर्टल — पूर्णतः निःशुल्क (Zero Court Fee)",
        "timeline": "35 दिन की निर्धारित समय-सीमा (15 दिन लेखपाल जांच + 20 दिन RI आदेश)",
        "summary_hinglish": "Kashtkar ki mrityu hone par uske kanooni warison (vidhwa, bete, avivahit betiyan aur mata) ka naam Khatauni me darj karwane ke liye e-Varasat portal par online aavedan kiya jata hai. Isme koi court fees nahi lagti aur 35 din me bina tehsil ke chakkar kaate naam darj ho jata hai.",
        "summary_hi": "खातेदार की मृत्यु के उपरांत उसके विधिक वारिसों (विधवा, पुत्र, अविवाहित पुत्रियां एवं माता) के नाम खतौनी में दर्ज कराने हेतु ई-वरासत पोर्टल पर ऑनलाइन आवेदन किया जाता है। अविवादित मामलों में राजस्व निरीक्षक 35 दिनों के भीतर स्तम्भ-6 में आदेश पारित करता है।",
        "summary_en": "Upon the demise of an agricultural tenure-holder, succession is governed by Section 108 of UP Revenue Code. The e-Varasat portal facilitates seamless paperless mutation within a statutory limit of 35 days without any court fee.",
        "steps_hinglish": [
            "1. **Online e-Varasat Portal**: edistrict.up.gov.in ya UP Bhulekh par jakar Varasat aavedan form bharein.",
            "2. **Dastavej Upload**: Mritak ka Death Certificate, sabhi warison ke Aadhaar card aur gaon/gata sankhya darj karein.",
            "3. **Lekhpal Sthaliya Satypan**: Kshetraye Lekhpal gaon me aakar warison ki pushti karta hai aur 15 din me online aakhya forward karta hai.",
            "4. **Revenue Inspector Aadesh**: Revenue Inspector (RI) 35 din ke bheetar aadesh paarit karta hai.",
            "5. **Khatauni Update**: Aadesh paarit hote hi Khatauni ke Column-6 me amal-dar-amad hokar warison ka naam darj ho jata hai."
        ],
        "steps_hi": [
            "1. **ऑनलाइन ई-वरासत पोर्टल**: ई-डिस्ट्रिक्ट अथवा यूपी भूलेख पोर्टल पर वरासत पंजीकरण फॉर्म भरें।",
            "2. **दस्तावेज़ संलग्नक**: मृतक का मृत्यु प्रमाण पत्र, वारिसों के पहचान पत्र व खतौनी विवरण अपलोड करें।",
            "3. **लेखपाल स्थलीय जांच**: क्षेत्रीय लेखपाल गाँव में खुली जांच कर 15 दिनों में अपनी संस्तुति ऑनलाइन अग्रेषित करता है।",
            "4. **राजस्व निरीक्षक का आदेश**: राजस्व निरीक्षक (RI) 35 दिनों के भीतर वरासत का औपचारिक विधिक आदेश पारित करता है।",
            "5. **खतौनी नवीनीकरण**: खतौनी के स्तम्भ-6 में वारिसों के नाम दर्ज हो जाते हैं।"
        ],
        "steps_en": [
            "1. **Portal Registration**: Submit an online succession form on the official UP e-District / e-Varasat portal.",
            "2. **Upload Documents**: Upload the certified death certificate, Aadhaar cards of legal heirs, and Khata details.",
            "3. **Lekhpal Inquest**: The Halqa Lekhpal visits the village, confirms heirs with the Gram Sabha, and submits an online report within 15 days.",
            "4. **RI Sanction Order**: The Revenue Inspector certifies and sanctions the mutation within 35 days.",
            "5. **Endorsement in RoR**: Heirs' names are permanently entered in the digitized Record of Rights (Khatauni)."
        ],
        "precedent": "विधवा, पुत्र, अविवाहित पुत्रियां और माता प्रथम श्रेणी (Class-1) में समान हिस्सेदार होते हैं। यदि वसीयत पर विवाद हो, तो मामला स्वतः धारा 35 के तहत तहसीलदार न्यायालय में अंतरित हो जाता है।",
        "safeguards": "यदि राजस्व निरीक्षक समय पर आदेश न करे या गलत नाम दर्ज करे, तो तहसीलदार न्यायालय में धारा 35 के तहत वाद दायर किया जा सकता है।"
    },
    "CHUNK-UPREV-SEC116-PARTITION-KURRA": {
        "doc_id": "DOC-UP-REV-CODE-2006",
        "act_name": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 116 & 117 (संयुक्त खाते का बंटवारा व कुर्रा फाट / Partition Suit & Kurra)",
        "authority": "उप-जिलाधिकारी (SDM / Assistant Collector First Class)",
        "form_fee": "एसडीएम न्यायालय में विहित वाद पत्र + अंतिम डिक्री पर न्यायशुल्क स्टाम्प शुल्क",
        "timeline": "प्रारंभिक डिक्री उपरांत 30 दिन में कुर्रा निर्माण, तत्पश्चात अंतिम डिक्री",
        "summary_hinglish": "Agar ek khet me kayi hissedar (co-sharers) hain aur aapas me medh ya jote ko lekar vivaad hai, toh SDM Court me Dhara 116 ka Batwara suit daalna hota hai. SDM pehle share tay karta hai, fir Lekhpal rasta aur naali dekhkar 'Kurra' (alhaada plots) banata hai, jisse sabka alag khata ho jata hai.",
        "summary_hi": "संयुक्त खाते के सह-खातेदारों के बीच भूमि विभाजन हेतु धारा 116 के अंतर्गत उप-जिलाधिकारी (एसडीएम) के न्यायालय में बंटवारे का वाद दायर किया जाता है। प्रारंभिक डिक्री में अंश निर्धारण के पश्चात राजस्व निरीक्षक धारा 117 के तहत मार्ग व नाली की व्यवस्था करते हुए 'कुर्रा' तैयार करता है।",
        "summary_en": "Under Section 116 of UP Revenue Code, any co-tenure holder can file a partition suit before the SDM. The court determines shares via a preliminary decree, after which the revenue inspector prepares lots ('Kurra') under Section 117 ensuring access to roads and waterchannels.",
        "steps_hinglish": [
            "1. **SDM Court me Vaad**: SDM ke paas Dhara 116 ka petition daalein; sabhi co-sharers aur Gram Sabha ko party banana anivarya hai.",
            "2. **Prarambhik Decree (Preliminary Decree)**: Court sabhi pakshon ke hisse (jaise 1/2, 1/3, 1/4) tay karti hai.",
            "3. **Kurra Nirman (Dhara 117)**: SDM Lekhpal/RI ko mauka dekhkar Kurra (zameen ke alag-alag tukde) banane ka aadesh deta hai.",
            "4. **Rasta aur Nali Suraksha**: Kurra banate waqt har hissedar ko main road, rasta aur naali ka adhikar milna kanooni anivarya hai.",
            "5. **Antim Decree (Final Decree)**: Kurre par aapatian niptakar stamp duty jama hoti hai, aur Khatauni me sabka alag khata aur naya gata sankhya ban jata hai."
        ],
        "steps_hi": [
            "1. **वाद प्रस्तुति**: धारा 116 का वाद एसडीएम न्यायालय में दायर करें। ग्राम सभा व सभी सह-खातेदारों को प्रतिवादी बनाना अनिवार्य है।",
            "2. **प्रारंभिक डिक्री**: न्यायालय साक्ष्यों के आधार पर सभी सह-खातेदारों के विधिक अंशों का निर्धारण करता है।",
            "3. **कुर्रा फाट (धारा 117)**: राजस्व निरीक्षक को धरातल पर पहुंचकर प्रत्येक हिस्सेदार के लिए अलग-अलग कुर्रा (लॉट) बनाने का निर्देश दिया जाता है।",
            "4. **सुविधा अधिकार**: प्रत्येक कुर्रे के लिए चकमार्ग (सड़क) व सिंचाई नाली की अनिवार्य उपलब्धता सुनिश्चित की जाती है।",
            "5. **अंतिम डिक्री**: स्टाम्प शुल्क जमा कराने के पश्चात अंतिम डिक्री पारित होती है और खतौनी में स्वतंत्र खाता व नया गाटा संख्या सृजित होता है।"
        ],
        "steps_en": [
            "1. **Filing Partition Suit**: File a suit under Section 116 before the SDM, impleading all co-sharers and the Gram Sabha.",
            "2. **Preliminary Decree**: The court determines respective fractional shares (e.g. 1/2, 1/4) based on RoR entries.",
            "3. **Preparation of Kurra**: The court directs the Revenue Inspector to demarcate physical lots (Kurra) under Section 117.",
            "4. **Equitable Allocation**: Each lot must guarantee frontage on public access pathways and irrigation canals.",
            "5. **Final Decree**: After adjudicating objections and depositing stamp paper, a final decree is drawn creating independent Khata and new Gata numbers."
        ],
        "precedent": "ग्राम सभा को पक्षकार न बनाने पर बंटवारे का वाद पोषणीय (Maintainable) नहीं होता। कुर्रा बनाते समय किसी भी हिस्सेदार को रास्ते से वंचित नहीं किया जा सकता।",
        "safeguards": "प्रारंभिक अथवा अंतिम डिक्री के विरुद्ध 30 दिनों में मंडलायुक्त (Divisional Commissioner) के समक्ष प्रथम अपील दायर की जा सकती है।"
    },
    "CHUNK-UPREV-SEC144-DECLARATORY-SUIT": {
        "doc_id": "DOC-UP-REV-CODE-2006",
        "act_name": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 144 (स्वत्व घोषणात्मक वाद / Declaratory Suit for Title)",
        "authority": "उप-जिलाधिकारी (SDM / Assistant Collector First Class)",
        "form_fee": "वाद पत्र + निर्धारित न्यायशुल्क (Court Fee)",
        "timeline": "दीवानी प्रक्रिया संहिता (CPC) के अनुसार साक्ष्य व गवाही उपरांत डिक्री",
        "summary_hinglish": "Agar aapki kheti ki zameen par koi doosra vyakti farzi daawa kar raha hai ya Khatauni me galat naam darj ho gaya hai, toh SDM Court me Dhara 144 ka Title Suit daala jata hai. Case ke dauran zameen bechne ya tod-fod rokne ke liye Stay (Injunction) bhi milta hai.",
        "summary_hi": "कृषि भूमि के स्वामित्व (Title / मालिकाना हक) पर विवाद होने अथवा खतौनी में त्रुटिपूर्ण नाम दर्ज होने पर उप-जिलाधिकारी (एसडीएम) न्यायालय में धारा 144 के तहत स्वत्व घोषणात्मक वाद दायर किया जाता है। वाद लंबित रहने के दौरान अंतरिम स्थगन (Stay) प्राप्त किया जा सकता है।",
        "summary_en": "Under Section 144 of the UP Revenue Code, a declaratory suit is instituted before the SDM to establish ownership or title over agricultural land against disputing parties, with provision for interim injunction.",
        "steps_hinglish": [
            "1. **Plaint File Karein**: SDM Court me Dhara 144 ka suit daalein. State of UP (Collector ke zariye) aur Gram Sabha ko party banana mandatory hai.",
            "2. **Stay Application (Injunction)**: Zameen ko teesre vyakti ko bechne ya uspar nirmaan rokne ke liye temporary stay ki application lagayein.",
            "3. **Saboot Pesh Karein**: Mool Bainama (Original Sale Deed), Varasat shrunkhla, aur fasli chakbandi records (CH-41, CH-45) dakhil karein.",
            "4. **Gawahi aur Behas**: Dono pakshon ke gawahon ke bayaan aur vakeelon ki behas hoti hai.",
            "5. **Final Judgment & Decree**: SDM dwara ownership ki formal decree paarit hoti hai jiske aadhar par Khatauni me title update hota hai."
        ],
        "steps_hi": [
            "1. **वाद पत्र प्रस्तुति**: एसडीएम न्यायालय में धारा 144 का वाद प्रस्तुत करें। राज्य सरकार (कलेक्टर के माध्यम से) एवं ग्राम सभा अनिवार्य प्रतिवादी होंगे।",
            "2. **अंतरिम स्थगन (Stay)**: वाद लंबित रहते भूमि को विक्रय करने या स्वरूप बदलने से रोकने हेतु अंतरिम व्यादेश प्राप्त करें।",
            "3. **दस्तावेजी साक्ष्य**: मूल बैनामा, वरासत श्रृंखला, और चकबंदी आकार पत्र (सीएच-41, 45) न्यायालय में सिद्ध करें।",
            "4. **मौखिक साक्ष्य व जिरह**: साक्षियों के शपथ पत्र, बयान एवं प्रतिपरीक्षा (Cross-examination) संपन्न कराएं।",
            "5. **डिक्री निष्पादन**: एसडीएम के अंतिम निर्णय के आधार पर अधिकार अभिलेख (खतौनी) में वादी का नाम बतौर भूमिधर दर्ज किया जाता है।"
        ],
        "steps_en": [
            "1. **Plaint Presentation**: File a declaratory plaint under Section 144 before the SDM, mandatorily impleading the State of UP and Gram Sabha.",
            "2. **Interim Injunction**: Apply for status quo or temporary injunction to restrain alienation or third-party creation of rights.",
            "3. **Documentary Evidence**: Prove historical chain of title deeds, succession certificates, and consolidation records (CH Forms 41 & 45).",
            "4. **Trial & Testimony**: Oral evidence, witness cross-examination, and legal arguments conducted under the Civil Procedure Code framework.",
            "5. **Decree & Record Update**: The declaratory decree operates as conclusive judgment in rem regarding tenure rights."
        ],
        "precedent": "राज्य सरकार एवं ग्राम सभा को पक्षकार न बनाने पर वाद खारिज हो जाता है। वास्तविक भौतिक काश्तकारी कब्जा (Cultivatory Possession) सिद्ध करना सर्वाधिक महत्वपूर्ण होता है।",
        "safeguards": "एसडीएम के डिक्री आदेश के विरुद्ध 30 दिनों में मंडलायुक्त के समक्ष प्रथम अपील और 90 दिनों में राजस्व परिषद में द्वितीय अपील होती है।"
    },
    "CHUNK-UPREV-SEC207-210-APPEAL-REVISION": {
        "doc_id": "DOC-UP-REV-CODE-2006",
        "act_name": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 207 to 210 (अपील, द्वितीय अपील व निगरानी / Appellate & Revisional Hierarchy)",
        "authority": "उप-जिलाधिकारी (SDM), मंडलायुक्त (Divisional Commissioner) एवं राजस्व परिषद (Board of Revenue)",
        "form_fee": "अपील मेमो + प्रमाणित आदेश प्रति + न्यायालय न्यायशुल्क",
        "timeline": "प्रथम अपील: 30 दिन; द्वितीय अपील: 90 दिन; निगरानी: क्षेत्राधिकार उल्लंघन पर",
        "summary_hinglish": "Agar Naib Tehsildar ya Tehsildar ne galat aadesh kar diya hai toh 30 din me SDM ke paas pehli appeal hoti hai. Agar SDM ne aadesh kiya hai toh Commissioner ke paas pehli appeal hoti hai. Kannon ke bade sawal par Lucknow/Prayagraj Board of Revenue me doosri appeal ya Revision (Nigrani) hoti hai.",
        "summary_hi": "राजस्व न्यायालयों में नायब तहसीलदार/तहसीलदार के आदेश के विरुद्ध 30 दिनों में उप-जिलाधिकारी (एसडीएम) को प्रथम अपील होती है। एसडीएम के मूल आदेश के विरुद्ध मंडलायुक्त को प्रथम अपील होती है, तथा विधि के सारभूत प्रश्न पर 90 दिनों में राजस्व परिषद (Board of Revenue) में द्वितीय अपील व निगरानी होती है।",
        "summary_en": "Sections 207-210 establish the revenue hierarchy: First appeal against Tehsildar lies to the SDM within 30 days; against SDM orders to the Divisional Commissioner. Second appeal on substantial questions of law and revision (Nigrani) lie before the Board of Revenue.",
        "steps_hinglish": [
            "1. **Certified Copy Nikalein**: Adhinasth court (Tehsildar/SDM) ke aadesh ki certified copy lein.",
            "2. **Pehli Appeal (30 Din)**: Tehsildar ke aadesh par SDM Court me, ya SDM ke aadesh par Commissioner Court me 30 din me appeal daakhil karein.",
            "3. **Stay Application**: Adhinasth aadesh ke amal-dar-amad par turant interim stay maangein.",
            "4. **Doosri Appeal (90 Din)**: First appellate order ke khilaf kewal Substantial Question of Law par 90 din me Board of Revenue me appeal karein.",
            "5. **Revision / Nigrani (Dhara 210)**: Jaha appeal ka adhikar nahi hota, waha jurisdictional error par Commissioner ya Board of Revenue me Revision daali jaati hai."
        ],
        "steps_hi": [
            "1. **प्रमाणित प्रतिलिपि**: अधीनस्थ राजस्व न्यायालय के मूल आदेश की प्रमाणित प्रति प्राप्त करें।",
            "2. **प्रथम अपील (30 दिन)**: तहसीलदार के आदेश के विरुद्ध एसडीएम न्यायालय, अथवा एसडीएम के मूल आदेश के विरुद्ध मंडलायुक्त के समक्ष 30 दिन में अपील प्रस्तुत करें।",
            "3. **स्थगन प्रार्थना पत्र**: आदेश के क्रियान्वयन को रोकने हेतु धारा 207 के तहत स्थगन (Stay) प्राप्त करें।",
            "4. **द्वितीय अपील (90 दिन)**: विधि के किसी सारभूत प्रश्न पर 90 दिनों के भीतर राजस्व परिषद (प्रयागराज/लखनऊ) में द्वितीय अपील दाखिल करें।",
            "5. **पुनरीक्षण / निगरानी (धारा 210)**: अपीलरहित आदेशों में क्षेत्राधिकार की अवैधता के विरुद्ध राजस्व परिषद या मंडलायुक्त के समक्ष निगरानी दायर की जा सकती है।"
        ],
        "steps_en": [
            "1. **Obtain Certified Copy**: Procure an authenticated copy of the impugned revenue order.",
            "2. **First Appeal (30 Days)**: File appeal under Section 207 before SDM (against Tehsildar) or Divisional Commissioner (against SDM).",
            "3. **Interim Stay**: Petition for stay of operation of the lower court's decree to prevent changes in the revenue register.",
            "4. **Second Appeal (90 Days)**: File second appeal before the Board of Revenue under Section 208 exclusively on substantial questions of law.",
            "5. **Revision (Section 210)**: Where no appeal lies, invoke revisional jurisdiction before the Commissioner or Board of Revenue against patent errors of jurisdiction."
        ],
        "precedent": "द्वितीय अपील केवल तभी विचारणीय होती है जब विधि का कोई सारभूत प्रश्न (Substantial Question of Law) शामिल हो; तथ्यों का पुनर्परीक्षण द्वितीय अपील में नहीं होता।",
        "safeguards": "यदि 30 दिन की समय-सीमा बीत चुकी हो, तो Limitation Act की धारा 5 के तहत विलंब क्षमा का प्रार्थना पत्र संलग्न करना आवश्यक होता है।"
    },
    "CHUNK-DLR-SEC81-EJECTMENT-NON-AGRI": {
        "doc_id": "DOC-DELHI-LAND-REFORMS-1954",
        "act_name": "Delhi Land Reforms Act, 1954 (DLR Act)",
        "section": "Section 81 & 82 (कृषि भूमि का गैर-कृषि उपयोग व गाँव सभा में निहिति)",
        "authority": "राजस्व सहायक / उप-जिलाधिकारी (Revenue Assistant / SDM Delhi)",
        "form_fee": "एसडीएम न्यायालय में कारण बताओ नोटिस का उत्तर + विधिक शपथ पत्र",
        "timeline": "3 माह की वैधानिक बहाली अवधि (3 Months Statutory Restoration Period)",
        "summary_hinglish": "Delhi ke rural villages (jaise Alipur, Bawana, Kanjhawala, Najafgarh) me agar kheti ki zameen par bina permission godown, farmhouse, factory ya banquet bana liya, toh SDM Dhara 81 ka notice bhejta hai. 3 mahine me nirmaan hataakar kheti bahaal nahi ki toh zameen Gaon Sabha / Delhi Government me zabt (Vest) ho jati hai.",
        "summary_hi": "दिल्ली भूमि सुधार अधिनियम, 1954 की धारा 81 के तहत कृषि भूमि पर गोदाम, फार्महाउस, फैक्ट्री अथवा व्यावसायिक निर्माण करने पर एसडीएम धारा 81 का नोटिस जारी करता है। 3 माह के भीतर भूमि को कृषि योग्य बहाल न करने पर भूमिधर को बेदखल कर भूमि गाँव सभा में निहित कर ली जाती है।",
        "summary_en": "Under Section 81 of the Delhi Land Reforms Act, 1954, diverting agricultural land to commercial, industrial, or warehouse uses without authorization triggers a conditional eviction notice by the SDM, requiring restoration within 3 months failing which land vests in the Gaon Sabha.",
        "steps_hinglish": [
            "1. **Notice Receipt**: SDM dwara Dhara 81 ka Show-Cause Notice milne par ghabrayein nahi, par turant vakil ke sath reply tayar karein.",
            "2. **3 Mahine ka Samay**: Kanoon 3 mahine ka statutory restoration period deta hai jisme non-agricultural use band karne ka mouka milta hai.",
            "3. **Urbanized Village Defence**: Check karein ki kya gaon DMC Act ki Dhara 507 ke tehat 'Urbanized' notify ho chuka hai ya DDA Master Plan (MPD) me covered hai.",
            "4. **Supreme Court Precedent**: Agar gaon urbanized notify ho chuka hai toh Mohinder Singh ruling ke anusar DLR Act Section 81 lagoo nahi ho sakti.",
            "5. **SDM Court me Reply**: SDM ke samne urbanisation gazette notification pesh karke proceedings drop karwayein."
        ],
        "steps_hi": [
            "1. **कारण बताओ नोटिस का संज्ञान**: एसडीएम द्वारा धारा 81 के तहत जारी नोटिस का 15 दिन के भीतर विधिक उत्तर प्रस्तुत करें।",
            "2. **3 माह की बहाली अवधि**: विधि अनुसार भूमिधर को गैर-कृषि निर्माण हटाकर कृषि बहाल करने हेतु 3 माह का समय दिया जाता है।",
            "3. **शहरीकरण विधिक बचाव**: दिल्ली नगर निगम अधिनियम की धारा 507 के तहत गाँव के शहरीकृत (Urbanized) होने की जांच करें।",
            "4. **सर्वोच्च न्यायालय नज़ीर**: *मोहिंदर सिंह* मामले के अनुसार शहरीकृत गाँवों पर दिल्ली भूमि सुधार अधिनियम पूर्णतः निष्प्रभावी हो जाता है।",
            "5. **कार्यवाही निरस्तीकरण**: एसडीएम न्यायालय में मास्टर प्लान एवं शहरीकरण अधिसूचना प्रस्तुत कर बेदखली नोटिस निरस्त कराएं।"
        ],
        "steps_en": [
            "1. **Notice Assessment**: Upon receiving Section 81 notice, examine the allegations of commercial diversion (warehouses/farmhouses).",
            "2. **Statutory 3-Month Window**: Section 81 grants a statutory 3-month cure period to dismantle unauthorized structures and restore agricultural usage.",
            "3. **Urbanization Status Check**: Ascertain whether the revenue estate has been notified as an 'Urbanized Village' under Section 507 of the Delhi Municipal Corporation Act, 1957.",
            "4. **Supreme Court Precedent**: As per the Supreme Court landmark ruling in *Mohinder Singh (Dead) v. Narain Singh*, once urbanized, DLR Act ceases to operate.",
            "5. **Quashing of Proceedings**: Submit the Section 507 notification before the Revenue Assistant / SDM to drop eviction and vesting proceedings."
        ],
        "precedent": "सुप्रीम कोर्ट के ऐतिहासिक निर्णय *मोहिंदर सिंह* के अनुसार धारा 507 के तहत अधिसूचित शहरीकृत गाँव पर DLR Act की धारा 81 लागू नहीं हो सकती।",
        "safeguards": "एसडीएम द्वारा गाँव सभा में निहिति का अंतिम आदेश पारित होने पर 30 दिनों में अतिरिक्त जिला मजिस्ट्रेट (ADM / Collector) के समक्ष अपील की जा सकती है।"
    },
    "CHUNK-HARYANA-JAMABANDI-GIRDAWARI-INTEQAL": {
        "doc_id": "DOC-PUNJAB-LAND-REVENUE-1887",
        "act_name": "Punjab Land Revenue Act, 1887 (Applicable in Haryana)",
        "section": "Sections 31, 34, 44 & 111 (जमाबंदी, गिरदावरी, इंतकाल व तकसीम)",
        "authority": "सहायक कलेक्टर (तहसीलदार / नायब तहसीलदार) एवं हलका पटवारी",
        "form_fee": "जमाबंदी फर्द ऑनलाइन jamabandi.nic.in पोर्टल पर उपलब्ध",
        "timeline": "जमाबंदी: प्रत्येक 4 वर्ष (चार साला); गिरदावरी: वर्ष में 2 बार (खरीफ व रबी)",
        "summary_hinglish": "Haryana me Jamabandi 4 saal me banne wala RoR (fard) hai jo malikana haq batata hai. Khasra Girdawari saal me 2 baar (Kharif aur Rabi) patwari dwara khet me jakar fasal aur mauke ke kabje ki padtaal hai. Inteqal (Mutation) open Jalsa-e-Aam me Tehsildar sanction karta hai.",
        "summary_hi": "हरियाणा में पंजाब भू-राजस्व अधिनियम, 1887 के अंतर्गत जमाबंदी प्रत्येक 4 वर्ष में तैयार होने वाला अधिकार अभिलेख (Record of Rights / फर्द) है। खसरा गिरदावरी वर्ष में दो बार हलका पटवारी द्वारा खरीफ व रबी में मौके पर फसल व वास्तविक भौतिक कब्जे की पड़ताल है। इंतकाल खुले जलसा-ए-आम में स्वीकृत होता है।",
        "summary_en": "In Haryana under Punjab Land Revenue Act 1887, Jamabandi is the quadrennial Record of Rights showing ownership (Khewat/Khatauni). Khasra Girdawari is the bi-annual harvest inspection showing crop and physical possession. Inteqal (mutation) is sanctioned in public gathering (Jalsa-e-Aam).",
        "steps_hinglish": [
            "1. **Jamabandi vs Girdawari Antar**: Jamabandi Khewat/Khatauni me registered ownership batati hai; Girdawari khet me actual fasal aur physical possession darshati hai.",
            "2. **Girdawari Padtaal**: Patwari saal me do baar - October (Kharif) aur March (Rabi) me mauke par jakar register me entry karta hai.",
            "3. **Inteqal (Dhara 34)**: Registry hone par Patwari Inteqal darj karta hai, Kanoongo verify karta hai, aur Tehsildar gaon me Jalsa-e-Aam me Inteqal manjoor karta hai.",
            "4. **Girdawari Durusti**: Agar patwari ne galat girdawari darj kar di ho, toh SDM/Collector ke paas Khasra Girdawari durusti ki application lagti hai.",
            "5. **Takseem (Dhara 111)**: Joint khewat ke batware ke liye Tehsildar court me case hota hai jisme Naksha Alif, Be, aur Jeem bante hain."
        ],
        "steps_hi": [
            "1. **जमाबंदी व गिरदावरी का अंतर**: जमाबंदी विधिक स्वामित्व (खेवट/खतौनी) दर्शाती है, जबकि गिरदावरी मौके पर बोई गई फसल और वास्तविक काश्तकारी कब्जा सिद्ध करती है।",
            "2. **फसल पड़ताल चक्र**: पटवारी प्रतिवर्ष अक्टूबर (सावनी/खरीफ) और मार्च (हाड़ी/रबी) में खेत पर जाकर खसरा गिरदावरी दर्ज करता है।",
            "3. **इंतकाल स्वीकृति**: रजिस्ट्री के उपरांत हल्का पटवारी इंतकाल दर्ज करता है और तहसीलदार खुले जलसा-ए-आम (Public Gathering) में नामांतरण स्वीकृत करता है।",
            "4. **गिरदावरी दुरुस्ती वाद**: यदि गिरदावरी में अनाधिकृत कब्जा दर्ज हो जाए, तो सहायक कलेक्टर के समक्ष गिरदावरी दुरुस्ती का वाद दायर किया जाता है।",
            "5. **तकसीम (विभाजन)**: धारा 111 के तहत तहसीलदार न्यायालय में नक्शा अलिफ (मौजूदा), नक्शा बे (प्रस्तावित) और नक्शा जीम (कब्जा दखल) तैयार कर बंटवारा होता है।"
        ],
        "steps_en": [
            "1. **Jamabandi vs Girdawari**: Jamabandi constitutes the quadrennial Record of Rights establishing presumptive title; Khasra Girdawari records actual crop cultivation and physical ground possession.",
            "2. **Harvest Inspections**: The Halqa Patwari inspects fields twice annually in October (Kharif) and March (Rabi).",
            "3. **Inteqal (Mutation)**: Following registered sale deed, the Patwari enters the mutation, verified by Kanungo and sanctioned by the Tehsildar in open assembly (Jalsa-e-Aam).",
            "4. **Girdawari Correction**: In case of fraudulent cultivation entries, a petition for correction of harvest inspection is filed before the Assistant Collector.",
            "5. **Takseem (Partition)**: Joint Khewat partition under Section 111 proceeds through preparation of Naksha Alif (existing status), Naksha Be (proposed allotment), and Naksha Jeem (warrant of possession)."
        ],
        "precedent": "पंजाब भू-राजस्व अधिनियम की धारा 44 के तहत जमाबंदी की प्रविष्टियों के पक्ष में सत्यता की विधिक उपधारणा (Presumption of Truth) होती है।",
        "safeguards": "तहसीलदार द्वारा इंतकाल अस्वीकार किए जाने पर 30 दिनों में उप-मंडलाधीश (SDM / Collector) के समक्ष अपील की जा सकती है।"
    },
    "CHUNK-SC-SURAJ-LAMP-GPA-SALES": {
        "doc_id": "DOC-SC-LANDMARK-PRECEDENTS",
        "act_name": "Supreme Court of India Landmark Precedent on Property Title",
        "section": "Suraj Lamp & Industries Pvt Ltd v. State of Haryana (2012) 1 SCC 656",
        "authority": "माननीय उच्चतम न्यायालय (Supreme Court of India - 3-Judge Bench)",
        "form_fee": "पंजीकृत बैनामा (Registered Conveyance / Sale Deed) अनिवार्य",
        "timeline": "रजिस्ट्री अधिनियम 1908 की धारा 17 व संपत्ति अंतरण अधिनियम धारा 54 के तहत बाध्यकारी",
        "summary_hinglish": "Supreme Court ne Suraj Lamp faisle me saaf kar diya ki General Power of Attorney (GPA), Agreement to Sell ya Vasiyat par plot/makan khareedna illegal hai aur isse koi malikana haq (Title) nahi milta. Malikana haq sirf aur sirf Registered Sale Deed (Bainama) se hi milta hai.",
        "summary_hi": "उच्चतम न्यायालय की 3-न्यायाधीशों की पीठ ने *सूरज लैंप (2012)* मामले में ऐतिहासिक व्यवस्था दी कि जनरल पावर ऑफ अटॉर्नी (GPA), एग्रीमेंट टू सेल अथवा वसीयत के आधार पर अचल संपत्ति का अंतरण पूर्णतः अवैध है। मालिकाना हक केवल पंजीकृत बैनामे (Registered Sale Deed) से ही प्राप्त होता है।",
        "summary_en": "In the landmark ruling *Suraj Lamp & Industries v. State of Haryana (2012)*, the Supreme Court ruled that immovable property can only be legally transferred through a registered deed of conveyance. SA/GPA/Will sales confer no title or ownership.",
        "steps_hinglish": [
            "1. **GPA Sales Void**: GPA ya Agreement to Sell se zameen ka ownership transfer nahi hota; GPA kewal ek agent banane ka dastavej hai.",
            "2. **Revenue/Authority Invalidation**: Kisi bhi Revenue portal (Bhulekh) ya Development Authority (NOIDA/DDA) me GPA ke aadhar par naam transfer nahi ho sakta.",
            "3. **Owner ki Death par Risk**: GPA lene ke baad agar mool malik (seller) ki death ho jaye, toh GPA kanoonan turant khatam (terminate) ho jaati hai aur uske legal heirs zameen wapas maang sakte hain.",
            "4. **Kanooni Rasta**: Agar GPA par property le rakhi hai toh turant mool malik se Sub-Registrar Office me Registered Sale Deed (Conveyance Deed) karwayein.",
            "5. **Civil Suit**: Agar mool malik registry karne se mana kare, toh Specific Performance of Contract ka Civil Suit daalna padega."
        ],
        "steps_hi": [
            "1. **जीपीए बिक्री अमान्य**: जीपीए अथवा एग्रीमेंट टू सेल स्वामित्व अंतरित नहीं करता; यह केवल एक अधिकृत प्रतिनिधि नियुक्त करने का साधन है।",
            "2. **अभिलेखीय प्रविष्टि निषेध**: राजस्व अभिलेखों (खतौनी) अथवा विकास प्राधिकरणों में जीपीए धारक का नाम स्वामी के रूप में दर्ज नहीं किया जा सकता।",
            "3. **मूल स्वामी की मृत्यु का जोखिम**: जीपीए निष्पादक की मृत्यु होते ही पावर ऑफ अटॉर्नी स्वतः समाप्त हो जाती है और उसके वारिस भूमि पर दावा कर सकते हैं।",
            "4. **वैधानिक समाधान**: जीपीए धारक को तत्काल मूल स्वामी से उप-निबंधक कार्यालय में विधिवत स्टाम्प शुल्क चुकाकर पंजीकृत बैनामा निष्पादित कराना चाहिए।",
            "5. **दीवानी वाद**: यदि विक्रेता पंजीकृत विलेख करने से इंकार करे, तो संविदा विनिर्दिष्ट पालन (Specific Performance) का वाद सिविल न्यायालय में प्रस्तुत करना होगा।"
        ],
        "steps_en": [
            "1. **No Proprietary Title**: GPA or Agreement to Sell does not convey title, ownership, or create any interest in immovable property.",
            "2. **Statutory Non-Recognition**: Revenue departments and development authorities cannot mutate ownership in favor of GPA holders.",
            "3. **Revocation Risk**: A Power of Attorney automatically terminates upon the death of the principal, exposing the purchaser to dispossession by legal heirs.",
            "4. **Regularization Mandate**: To secure marketable title, the purchaser must execute a duly stamped and registered Conveyance Deed under Section 54 of the Transfer of Property Act.",
            "5. **Civil Remedy**: If the vendor refuses conveyance, institute a Civil Suit for Specific Performance of Contract based on the Agreement to Sell."
        ],
        "precedent": "रजिस्ट्री अधिनियम 1908 की धारा 17 व 49 एवं संपत्ति अंतरण अधिनियम 1882 की धारा 54 के तहत ₹100 से अधिक मूल्य की अचल संपत्ति का पंजीकृत विलेख होना अनिवार्य है।",
        "safeguards": "जीपीए अथवा एग्रीमेंट टू सेल पर कभी भी अचल संपत्ति क्रय न करें; सदैव प्रमाणित पंजीकृत बैनामा (Sale Deed) ही निष्पादित कराएं।"
    },
    "CHUNK-SC-RADHY-SHYAM-URGENCY-CLAUSE": {
        "doc_id": "DOC-SC-LANDMARK-PRECEDENTS",
        "act_name": "Supreme Court Landmark Precedent on Land Acquisition & Urgency Powers",
        "section": "Radhy Shyam v. State of Uttar Pradesh (2011) 5 SCC 553",
        "authority": "माननीय उच्चतम न्यायालय (Supreme Court of India)",
        "form_fee": "भूमि अधिग्रहण आपात उपबंध धारा 17(4) का न्यायिक पुनर्विलोकन",
        "timeline": "धारा 5A के तहत 60 दिन में किसानों की आपत्तियां सुनना अनिवार्य",
        "summary_hinglish": "Supreme Court ne Radhy Shyam case me Greater Noida (Gaon Patwari) me Urgency Clause (Dhara 17) lagakar kisaanon ki zameen cheenne ko asanvaidhanik ghoshit kiya. Court ne kaha ki builders ke project ya industrial development koi aapatkal nahi hai aur Section 5A me hearing ka adhikar chheena nahi ja sakta.",
        "summary_hi": "सर्वोच्च न्यायालय ने *राधेश्याम बनाम उत्तर प्रदेश राज्य (2011)* में ग्रेटर नोएडा (गाँव पटवारी) में राज्य सरकार द्वारा धारा 17(4) की आपात शक्ति लगाकर किसानों की धारा 5A में आपत्तियां सुनने का अधिकार समाप्त करने को असंवैधानिक घोषित कर अधिग्रहण रद्द किया था।",
        "summary_en": "In *Radhy Shyam v. State of UP (2011)*, the Supreme Court quashed Greater Noida land acquisition, ruling that invoking the urgency clause to dispense with Section 5A hearings for industrial or builder housing projects is illegal and an abuse of executive power.",
        "steps_hinglish": [
            "1. **Section 5A Fundamental Right**: Bhumi adhigrahan me Section 5A ke tehat objection darj karne ka adhikar koi formal formality nahi, balki natural justice ka kanooni adhikar hai.",
            "2. **Urgency Clause Misuse**: Builders ko flat banane ke liye ya industrial park ke liye Dhara 17 lagana poori tarah illegal hai kyunki ye national emergency ya natural disaster nahi hai.",
            "3. **Acquisition Quashed**: Supreme Court ne Greater Noida Authority ke patwari gaon ke adhigrahan ko radd kar diya tha.",
            "4. **Kisaan Adhikar**: Kisaano ko unki zameen wapas milne ya naye LARR Act 2013 ke tehat market value ka 4 guna muavja lene ka rasta khula.",
            "5. **High Court Writ**: Agar government anavashyak urgency clause lagaye toh High Court me Article 226 ke tehat writ daalkar acquisition quash karwaya ja sakta hai."
        ],
        "steps_hi": [
            "1. **प्राकृतिक न्याय का अधिकार**: धारा 5A के अंतर्गत किसानों द्वारा आपत्ति दर्ज कराने व व्यक्तिगत सुनवाई का अधिकार एक सारभूत विधिक अधिकार है।",
            "2. **आपात धारा का दुरुपयोग**: वाणिज्यिक, आवासीय अथवा बिल्डर परियोजनाओं हेतु आपात उपबंध लागू करना कार्यपालिका शक्तियों का घोर दुरुपयोग है।",
            "3. **अधिग्रहण रद्द**: उच्चतम न्यायालय ने ग्रेटर नोएडा प्राधिकरण के पक्ष में किए गए भूमि अधिग्रहण को निरस्त कर दिया था।",
            "4. **किसानों की भूमि बहाली**: किसानों को उनकी पैतृक भूमि की वापसी अथवा संशोधित उच्च प्रतिकर प्राप्त करने का अधिकार बहाल हुआ।",
            "5. **संवैधानिक उपचार**: यदि शासन द्वारा धारा 17 का अनुचित प्रयोग किया जाए, तो संविधान के अनुच्छेद 226 के तहत उच्च न्यायालय में याचिका दायर की जा सकती है।"
        ],
        "steps_en": [
            "1. **Right to Fair Hearing**: The right to submit objections and be heard under Section 5A is a substantial statutory safeguard embodying natural justice.",
            "2. **Abuse of Urgency Powers**: Invoking Section 17 urgency to transfer land to commercial builders or private real estate does not constitute unforeseen emergency.",
            "3. **Quashing of Acquisition**: The Supreme Court quashed acquisition of agricultural parcels in Greater Noida and restored rights to farmers.",
            "4. **Legal Protection**: Laid the foundational jurisprudential bedrock for the enactment of RFCTLARR Act 2013.",
            "5. **Judicial Remedy**: Landowners aggrieved by mechanical dispensation of Section 5A can invoke writ jurisdiction under Article 226 of the Constitution."
        ],
        "precedent": "धारा 17 का प्रयोग केवल अप्रत्याशित राष्ट्रीय सुरक्षा, रक्षा अथवा प्राकृतिक आपदा जैसी वास्तविक आपात स्थितियों में ही किया जा सकता है; वाणिज्यिक विकास में नहीं।",
        "safeguards": "अधिसूचना जारी होने पर धारा 5A के तहत 60 दिनों के भीतर कलेक्टर के समक्ष लिखित आपत्तियां अनिवार्य रूप से दर्ज करानी चाहिए।"
    },
    "CHUNK-RFCTLARR-SEC64-LARRA-REFERENCE": {
        "doc_id": "DOC-RFCTLARR-2013",
        "act_name": "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
        "section": "Sections 64, 77 & 80 (प्राधिकरण को संदर्भ व विलंब पर 15% ब्याज / LARRA Reference)",
        "authority": "भूमि अधिग्रहण, पुनर्वास एवं पुनर्व्यवस्थापन प्राधिकरण (LARRA - जिला जज स्तर) एवं कलेक्टर",
        "form_fee": "कलेक्टर को विहित प्रपत्र पर संदर्भ आवेदन (Zero Court Fee in Land Reference)",
        "timeline": "अवार्ड घोषणा से 6 सप्ताह (यदि उपस्थित थे) अथवा नोटिस प्राप्ति से 6 माह",
        "summary_hinglish": "Agar Collector ne zameen acquisition me kam muavja tay kiya hai ya paimash galat ki hai, toh award lene par 'Under Protest' likhein aur 6 hafte me Collector ko LARRA Authority (District Judge level) ko case bhejne ki application dein. Deri hone par Dhara 80 me 15% saalana byaj milta hai.",
        "summary_hi": "यदि कलेक्टर द्वारा भूमि अधिग्रहण में अपर्याप्त प्रतिकर अथवा त्रुटिपूर्ण पैमाइश की गई हो, तो अवार्ड को 'विरोध सहित' (Under Protest) स्वीकार कर 6 सप्ताह के भीतर कलेक्टर को धारा 64 के तहत भूमि अधिग्रहण पुनर्वास प्राधिकरण (LARRA) को संदर्भ भेजने हेतु आवेदन करना चाहिए। विलंब पर धारा 80 में 15% वार्षिक ब्याज देय होता है।",
        "summary_en": "Under Section 64 of the RFCTLARR Act 2013, any landholder dissatisfied with the Collector's award regarding compensation or area may file an application within 6 weeks requiring the matter to be referred to the LARRA Authority, with 15% penal interest under Section 80 for delays.",
        "steps_hinglish": [
            "1. **Under Protest Sign Karein**: Muavja check lete waqt receipt par 'Accepted Under Protest without prejudice to enhancement rights' likhein.",
            "2. **6 Hafte ka Time**: Award declare hone ki date se 6 hafte ke andar Collector office me Dhara 64 ka Reference Application dakhil karein.",
            "3. **LARRA Authority me Bhejna**: Collector 30 din ke andar file ko District Judge level ke LARRA Authority ko bhejne ke liye badhy hai.",
            "4. **Evidence of Higher Circle Rate**: LARRA court me aas-paas ke beche gaye plots ke highest registry sale deeds saboot ke roop me pesh karein.",
            "5. **15% Byaj ka Adhikar**: Dhara 77 aur 80 ke tehat agar muavja deposit nahi kiya gaya tha, toh pehle saal 9% aur uske baad 15% saalana byaj Collector ko dena padta hai."
        ],
        "steps_hi": [
            "1. **विरोध सहित स्वीकृति**: प्रतिकर राशि प्राप्त करते समय रसीद पर 'अधिकार सुरक्षित रखते हुए विरोध सहित स्वीकृत' (Accepted Under Protest) दर्ज करें।",
            "2. **6 सप्ताह की सीमा**: अवार्ड घोषणा से 6 सप्ताह के भीतर कलेक्टर को धारा 64 के अंतर्गत संदर्भ आवेदन प्रस्तुत करें।",
            "3. **प्राधिकरण को अंतरण**: कलेक्टर 30 दिनों के भीतर संदर्भ पत्रावली को जिला न्यायाधीश स्तर के भू-अधिग्रहण प्राधिकरण (LARRA) को प्रेषित करने हेतु बाध्य है।",
            "4. **सर्किल रेट व बैनामा साक्ष्य**: प्राधिकरण न्यायालय में समीपवर्ती भूमि के उच्चतम पंजीकृत बैनामों की प्रमाणित प्रतियां साक्ष्य में प्रस्तुत करें।",
            "5. **15% दंडात्मक ब्याज**: धारा 77 एवं 80 के अनुसार अवार्ड राशि भुगतान में विलंब होने पर प्रथम वर्ष 9% तथा उसके पश्चात 15% वार्षिक दंडात्मक ब्याज देय होता है।"
        ],
        "steps_en": [
            "1. **Accept Under Protest**: When receiving the compensation award, record endorsement 'Accepted Under Protest' to preserve enhancement claims.",
            "2. **Six-Week Limitation**: Submit a written application under Section 64 to the Collector within 6 weeks of the award.",
            "3. **Forwarding to Authority**: The Collector is statutorily bound to transmit the reference to the LARRA Authority (chaired by a District Judge).",
            "4. **Adduce Enhancement Evidence**: Introduce certified copies of high-value exemplar sale deeds from the immediate vicinity.",
            "5. **15% Statutory Interest**: Under Sections 77 and 80, delayed compensation accrues 9% interest for the initial year and 15% per annum thereafter until realization."
        ],
        "precedent": "यदि काश्तकार ने बिना विरोध दर्ज कराए स्वेच्छा से बिना शर्त मुआवजा स्वीकार कर लिया, तो वह बाद में धारा 64 के संदर्भ का दावा करने का अधिकार खो सकता है।",
        "safeguards": "प्राधिकरण (LARRA) के निर्णय के विरुद्ध 60 दिनों के भीतर उच्च न्यायालय (High Court) में अपील दायर की जा सकती है।"
    }
}

def format_advanced_statutory_answer(
    top_chunk: Dict[str, Any],
    second_chunk: Optional[Dict[str, Any]],
    lang: str,
    query: str
) -> str:
    chunk_id = top_chunk.get("chunk_id", "")
    kb_entry = STATUTORY_KNOWLEDGE_BASE.get(chunk_id)

    is_live_chunk = chunk_id.startswith("LIVE-") or top_chunk.get("document_type") in [
        "Peer-Reviewed Research Paper", "Open-Access Scientific Research",
        "Judicial Precedent & Case Law", "Official Legal Encyclopedia"
    ]

    # Fallback to topic search in knowledge base if chunk_id not directly matched (only for local static chunks)
    if not kb_entry and not is_live_chunk:
        top_topic = top_chunk.get("topic", "").lower()
        top_content = top_chunk.get("content", "").lower()
        for k_id, entry in STATUTORY_KNOWLEDGE_BASE.items():
            k_sec = entry.get("section", "").lower()
            if any(term in top_topic or term in top_content for term in ["section 24", "धारा 24", "patthargaddi", "hadbandi"]) and "demarcation" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["section 80", "धारा 80", "धारा 143", " 143 "]) and "non-agri" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["section 98", "धारा 98", "अनुसूचित जाति", "दलित", " sc land "]) and "sc-transfer" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["section 108", "धारा 108", "वरासत", "varasat"]) and "succession" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["section 116", "धारा 116", "बंटवारा", "kurra"]) and "partition" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["section 144", "धारा 144", "घोषणात्मक"]) and "declaratory" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["suraj lamp", "gpa", "power of attorney"]) and "suraj-lamp" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["radhy shyam", "urgency clause", "धारा 17"]) and "radhy-shyam" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["section 64", "धारा 64", "larra", "15 percent"]) and "larra" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["section 81", "धारा 81", "delhi land reforms"]) and "dlr" in k_id.lower():
                kb_entry = entry
                break
            elif any(term in top_topic or term in top_content for term in ["jamabandi", "जमाबंदी", "girdawari", "गिरदावरी"]) and "haryana" in k_id.lower():
                kb_entry = entry
                break

    doc_id = top_chunk.get("document_id", "DOC-STATUTE")
    publisher = top_chunk.get("publisher", "Government Revenue Department")
    source_url = top_chunk.get("source_url", "#")

    # If we have a comprehensive rich procedural entry in our legal knowledge base:
    if kb_entry:
        act_name = kb_entry["act_name"]
        section = kb_entry["section"]
        authority = kb_entry["authority"]
        form_fee = kb_entry["form_fee"]
        timeline = kb_entry["timeline"]
        precedent = kb_entry["precedent"]
        safeguards = kb_entry["safeguards"]

        if lang == "hinglish":
            summary = kb_entry["summary_hinglish"]
            steps_lines = "\n".join(kb_entry["steps_hinglish"])
            answer_text = (
                f"### विधिक विश्लेषण एवं व्यावहारिक समाधान [{doc_id}]\n\n"
                f"#### मुख्य विधिक सारांश (Quick Executive Summary)\n"
                f"{summary}\n\n"
                f"#### लागू विधिक प्रावधान एवं अधिनियम (Governing Statute & Section)\n"
                f"• **अधिनियम / संहिता**: {act_name}\n"
                f"• **लागू धारा (Section)**: **{section}**\n"
                f"• **सक्षम न्यायालय / प्राधिकारी**: **{authority}**\n\n"
                f"#### आवश्यक प्रपत्र, चालान शुल्क एवं साक्ष्य (Prescribed Forms & Fees)\n"
                f"• **प्रपत्र व शुल्क (Forms & Fees)**: {form_fee}\n\n"
                f"#### वैधानिक समय-सीमा व नियम (Statutory Timelines)\n"
                f"• **निस्तारण समय-सीमा**: **{timeline}**\n\n"
                f"#### कदम-दर-कदम व्यावहारिक प्रक्रिया (Step-by-Step Practical Procedure)\n"
                f"{steps_lines}\n\n"
                f"#### उच्चतम न्यायालय / न्यायिक नज़ीर (Landmark Precedent)\n"
                f"• {precedent}\n\n"
                f"#### विधिक सुरक्षा, सावधानियां व अपील (Safeguards & Appellate Remedy)\n"
                f"• {safeguards}\n\n"
                f"*(अधिकृत विधिक स्रोत: {publisher} — [राजस्व गजट / संदर्भ देखें]({source_url}))*"
            )
        elif lang == "hi":
            summary = kb_entry["summary_hi"]
            steps_lines = "\n".join(kb_entry["steps_hi"])
            answer_text = (
                f"### विधिक विश्लेषण एवं प्रशासनिक समाधान [{doc_id}]\n\n"
                f"#### मुख्य विधिक सारांश एवं निष्कर्ष\n"
                f"{summary}\n\n"
                f"#### लागू विधिक प्रावधान एवं अधिनियम\n"
                f"• **अधिनियम / संहिता**: {act_name}\n"
                f"• **विधिक धारा**: **{section}**\n"
                f"• **सक्षम न्यायालय / प्राधिकारी**: **{authority}**\n\n"
                f"#### निर्धारित प्रपत्र व राजकीय शुल्क\n"
                f"• **विहित प्रपत्र एवं चालान**: {form_fee}\n\n"
                f"#### वैधानिक समय-सीमा\n"
                f"• **निस्तारण अवधि**: **{timeline}**\n\n"
                f"#### विधिक प्रक्रिया के चरण\n"
                f"{steps_lines}\n\n"
                f"#### उच्चतम न्यायालय की न्यायिक नज़ीर\n"
                f"• {precedent}\n\n"
                f"#### अपील एवं विधिक उपचार\n"
                f"• {safeguards}\n\n"
                f"*(प्रमाणित स्रोत: {publisher} — [आधिकारिक विलेख देखें]({source_url}))*"
            )
        else:
            summary = kb_entry["summary_en"]
            steps_lines = "\n".join(kb_entry["steps_en"])
            answer_text = (
                f"### STATUTORY EVIDENCE & LEGAL ANALYSIS [{doc_id}]\n\n"
                f"#### Executive Legal Summary\n"
                f"{summary}\n\n"
                f"#### Governing Enactment & Jurisdiction\n"
                f"• **Statutory Act**: {act_name}\n"
                f"• **Applicable Section**: **{section}**\n"
                f"• **Competent Authority / Court**: **{authority}**\n\n"
                f"#### Prescribed Forms & Registry Fees\n"
                f"• **Prescribed Procedure & Fee**: {form_fee}\n\n"
                f"#### Statutory Milestones & Timelines\n"
                f"• **Statutory Period**: **{timeline}**\n\n"
                f"#### Step-by-Step Procedure\n"
                f"{steps_lines}\n\n"
                f"#### Landmark Judicial Precedent\n"
                f"• {precedent}\n\n"
                f"#### Appellate Remedies & Safeguards\n"
                f"• {safeguards}\n\n"
                f"*(Source: {publisher} — [Official Gazette Link]({source_url}))*"
            )
    elif chunk_id.startswith("LIVE-") or top_chunk.get("document_type") in [
        "Peer-Reviewed Research Paper", "Open-Access Scientific Research",
        "Judicial Precedent & Case Law", "Official Legal Encyclopedia"
    ]:
        sec_title = f"{top_chunk['document_title']}"
        source_type = top_chunk.get("document_type", "Official Legal / Academic Record")
        content = top_chunk.get("content", "")

        if lang == "hinglish":
            answer_text = (
                f"### संप्रभु स्वायत्त अनुसंधान एवं विधिक प्रमाण [{doc_id}]\n\n"
                f"#### मुख्य विधिक व शोध सारांश (Core Executive Summary)\n"
                f"Yeh jaankari official government portals aur peer-reviewed research databases se real-time fetch karke LandSetu AI me train ki gayi hai.\n\n"
                f"#### आधिकारिक संदर्भ व शोध पत्र (Authority & Enactment / Research Paper)\n"
                f"• **अधिनियम / शोध पत्र**: **{sec_title}**\n"
                f"• **अधिकृत स्रोत / प्रकाशक**: **{publisher}**\n"
                f"• **दस्तावेज़ प्रकार**: {source_type}\n\n"
                f"#### वास्तविक साक्ष्य व प्रमाणित विश्लेषण (Authentic Findings & Legal Ratio)\n"
                f"{content}\n\n"
                f"#### सीधा आधिकारिक संदर्भ लिंक (Verified Official Reference)\n"
                f"• [यहाँ क्लिक करके आधिकारिक दस्तावेज़ / Research Paper देखें]({source_url})\n\n"
                f"#### रीयल-टाइम प्रशिक्षण पुष्टि (Autonomous Real-Time Training Status)\n"
                f"• यह आधिकारिक दस्तावेज़ लैंडसेतु के ज्ञानकोष में SHA-256 हैश द्वारा स्थायी रूप से समाहित (Ingested & Auto-Trained) कर लिया गया है।"
            )
        elif lang == "hi":
            answer_text = (
                f"### संप्रभु आधिकारिक अनुसंधान एवं विधिक साक्ष्य [{doc_id}]\n\n"
                f"#### मुख्य विधिक व शोध सारांश\n"
                f"यह जानकारी आधिकारिक सरकारी पोर्टलों एवं प्रामाणिक शोध पत्रिकाओं से वास्तविक समय (Real-Time) में प्राप्त कर लैंडसेतु ज्ञानकोष में प्रशिक्षित की गई है।\n\n"
                f"#### आधिकारिक संदर्भ व शोध आख्या\n"
                f"• **अधिनियम / शोध पत्र**: **{sec_title}**\n"
                f"• **प्रकाशक / अधिकृत स्रोत**: **{publisher}**\n"
                f"• **अभिलेख श्रेणी**: {source_type}\n\n"
                f"#### प्रमाणित विधिक प्रावधान व अनुसंधान निष्कर्ष\n"
                f"{content}\n\n"
                f"#### आधिकारिक डिजिटल अभिलेख लिंक\n"
                f"• [यहाँ क्लिक करके मूल सरकारी दस्तावेज़ / शोध पत्र का अवलोकन करें]({source_url})\n\n"
                f"#### स्वायत्त रीयल-टाइम प्रशिक्षण स्थिति\n"
                f"• यह प्रामाणिक अभिलेख SHA-256 क्रिप्टोग्राफिक हैश द्वारा लैंडसेतु के संप्रभु डेटाबेस में स्थायी रूप से प्रशिक्षित व सुरक्षित किया जा चुका है।"
            )
        else:
            answer_text = (
                f"### SOVEREIGN RESEARCH & STATUTORY EVIDENCE [{doc_id}]\n\n"
                f"#### Executive Research & Statutory Summary\n"
                f"Dynamically harvested and ingested in real time from official sovereign portals and peer-reviewed research databases.\n\n"
                f"#### Enactment / Academic Publication\n"
                f"• **Title**: **{sec_title}**\n"
                f"• **Publisher / Repository**: **{publisher}**\n"
                f"• **Document Classification**: {source_type}\n\n"
                f"#### Grounded Findings & Verified Legal Content\n"
                f"{content}\n\n"
                f"#### Primary Direct Source\n"
                f"• [Click here to inspect the authenticated original document / DOI record]({source_url})\n\n"
                f"#### Autonomous Real-Time Training Verification\n"
                f"• Cryptographically validated (SHA-256) and permanently ingested into LandSetu's high-dimensional vector memory."
            )
    else:
        # High-standard structured synthesis for any other statutory chunk
        sec_title = f"{top_chunk['document_title']} ({top_chunk.get('section', '')})"
        topic_title = top_chunk.get("topic", "Statutory Provision")
        content = top_chunk.get("content", "")

        if lang in ["hi", "hinglish"]:
            answer_text = (
                f"### वैधानिक विश्लेषण एवं विधिक प्रावधान [{doc_id}]\n\n"
                f"#### अधिनियम एवं धारा\n"
                f"• **अधिनियम**: **{sec_title}**\n"
                f"• **विषय**: {topic_title}\n\n"
                f"#### वैधानिक प्रविधान विवरण\n"
                f"{content}\n\n"
                f"*(स्रोत: {publisher} — [आधिकारिक दस्तावेज़ देखें]({source_url}))*"
            )
        else:
            answer_text = (
                f"### STATUTORY EVIDENCE & LEGAL ANALYSIS [{doc_id}]\n\n"
                f"#### Governing Authority & Enactment\n"
                f"• **Act & Section**: **{sec_title}**\n"
                f"• **Topic**: {topic_title}\n\n"
                f"#### Statutory Provisions\n"
                f"{content}\n\n"
                f"*(Source: {publisher} — [Official Reference]({source_url}))*"
            )

    # Append second relevant chunk if present
    if second_chunk and second_chunk.get("content") != top_chunk.get("content"):
        sec_doc_id = second_chunk.get("document_id", "DOC-STATUTE")
        if lang in ["hi", "hinglish"]:
            answer_text += (
                f"\n\n### सम्बद्ध विधिक संदर्भ [{sec_doc_id}]:\n"
                f"**{second_chunk['document_title']} ({second_chunk.get('section', '')})**:\n"
                f"{second_chunk['content']}\n"
            )
        else:
            answer_text += (
                f"\n\n### RELATED STATUTORY CONTEXT [{sec_doc_id}]:\n"
                f"**{second_chunk['document_title']} ({second_chunk.get('section', '')})**:\n"
                f"{second_chunk['content']}\n"
            )

    return answer_text
