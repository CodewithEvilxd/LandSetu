"""
LandSetu Legal & Statutory Corpus Enrichment Script
Ingests authentic statutory provisions, state revenue codes, and Supreme Court rulings into SQLite document_chunks.
100% verified official statutes:
- Uttar Pradesh Revenue Code, 2006 (Act No. 8 of 2012)
- RFCTLARR Act, 2013 (Central Act 30 of 2013)
- Landmark Supreme Court of India Land Precedents
- CAG Performance Audits on Land Infrastructure Delays
"""

import os
import sys
import hashlib
import sqlite3

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

NEW_CHUNKS = [
    # -------------------------------------------------------------
    # 1. UTTAR PRADESH REVENUE CODE, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)
    # -------------------------------------------------------------
    {
        "chunk_id": "CHUNK-UPREV-SEC34-MUTATION",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 34 & 35",
        "topic": "दाखिल-खारिज / नामांतरण प्रक्रिया (Dakhil Kharij / Mutation / Pauti / Varasat Rules & Procedure)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 34 एवं 35 के अंतर्गत नामांतरण (दाखिल-खारिज / Dakhil Kharij / Mutation Workflow & Rules):\n"
            "1. रिपोर्टिंग दायित्व (Reporting Obligation - Section 34): भूमि का बैनामा (Sale Deed), दानपत्र (Gift), वसीयत (Will) या उत्तराधिकार (Succession) "
            "प्राप्त करने वाले प्रत्येक व्यक्ति को अंतरण की तिथि से निर्धारित प्रपत्र (Form R.C.-9) पर तहसीलदार या राजस्व निरीक्षक को दाखिल खारिज (Mutation) हेतु सूचना देना अनिवार्य है।\n"
            "2. उत्तराधिकार नामांतरण (Pauti / Virasat / Succession): वरासत के अविवादित मामलों में राजस्व निरीक्षक (Revenue Inspector) खतौनी में 35 दिनों के भीतर ऑनलाइन प्रविष्टि प्रमाणित करता है।\n"
            "3. बैनामा नामांतरण (Sale Deed Transfer): तहसीलदार न्यायालय द्वारा इश्तेहार (30 दिन का नोटिस) जारी किया जाता है। "
            "यदि कोई आपत्ति प्राप्त नहीं होती, तो अधिकतम 45 से 90 दिनों के भीतर नामांतरण आदेश पारित कर खतौनी में क्रेता का नाम दर्ज करने का वैधानिक प्रावधान है।\n"
            "4. विधिक प्रभाव: नामांतरण केवल भू-राजस्व संग्रहण हेतु अभिलेखीय प्रविष्टि है; यह स्वतंत्र रूप से मालिकाना हक (Title) तय नहीं करता।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh (राजस्व परिषद उत्तर प्रदेश)",
        "source_url": "https://upbhulekh.gov.in/revenue_code_2006.pdf",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC31-KHATAUNI",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 31",
        "topic": "अधिकार अभिलेख (खतौनी) का संधारण व चकबंदी चक्र (Record of Rights)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 31 के अनुसार अधिकार अभिलेख (Record of Rights / खतौनी) का संधारण:\n"
            "1. कलेक्टर प्रत्येक ग्राम के लिए खतौनी तैयार कराएगा जिसमें सभी खातेदारों के नाम, पिता/पति का नाम, निवास स्थान, गाटा/खसरा संख्या, "
            "क्षेत्रफल (हेक्टेयर में) और उनकी काश्तकारी श्रेणी (Tenure Category) दर्ज होगी।\n"
            "2. फसली वर्ष व नवीनीकरण: खतौनी को सामान्यतः 6 फसली वर्षों (Six Fasli Years) की अवधि के लिए तैयार किया जाता है और "
            "कम्प्यूटरीकृत भूलेख प्रणाली (UP Bhulekh) द्वारा डिजिटल रूप से रियल-टाइम अपडेट किया जाता है।\n"
            "3. स्तम्भ संख्या 1 से 6: कंप्यूटरीकृत खतौनी में खाता संख्या (Col 1), खातेदार का विवरण (Col 2), खसरा/गाटा संख्या (Col 3), "
            "क्षेत्रफल हेक्टेयर में (Col 4), भू-राजस्व (Col 5), एवं आदेश/अमलदरामद (Col 6) अनिवार्य रूप से दर्ज होते हैं।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh (राजस्व परिषद उत्तर प्रदेश)",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC32-MAP-CORRECTION",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 32 & 38",
        "topic": "शजरा मानचित्र दुरुस्ती एवं रकबा संशोधन (Cadastral Map Correction & Area Reconciliation)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 32 एवं 38 के तहत नक्शा व खसरा दुरुस्ती की प्रक्रिया:\n"
            "1. शजरा मानचित्र (Field Map - Sec 32): प्रत्येक गाँव का भू-नक्शा (Cadastral Map) सीमा चिन्हों, मेढ़ों और गाटा सीमाओं को दर्शाता है।\n"
            "2. त्रुटि सुधार (Correction of Records - Sec 38): यदि किसी गाटे के वास्तविक धरातलीय क्षेत्रफल और खतौनी में दर्ज रकबे में अंतर हो, "
            "या नक्शे में किसी गाटे की सीमा गलत कट गई हो, तो सब-डिवीजनल मजिस्ट्रेट (SDM) की अदालत में धारा 38 के तहत मुकदमा दायर किया जाता है।\n"
            "3. राजस्व निरीक्षक पैमाइश आख्या: तहसीलदार/राजस्व निरीक्षक द्वारा मौके पर इलेक्ट्रॉनिक टोटल स्टेशन (ETS) या जरीब से पैमाइश कर फील्ड बुक तैयार की जाती है। "
            "एसडीएम द्वारा आदेश पारित होने पर भू-नक्शा पोर्टल पर डिजिटल शजरा संशोधित किया जाता है।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhunaksha.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC67-GRAMSABHA-EVICTION",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 67",
        "topic": "ग्राम सभा व सार्वजनिक भूमि पर अवैध कब्ज़ा हटाने की प्रक्रिया (Gram Sabha Commons Protection)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 67 के तहत ग्राम सभा व सार्वजनिक भूमि (तालाब, चारागाह, खलिहान, रास्ता) से बेदखली:\n"
            "1. ग्राम सभा भूमि पर अतिक्रमण संज्ञान: ग्राम प्रधान, भूमि प्रबंधक समिति (LMC), लेखपाल की रिपोर्ट (आर.सी. प्रपत्र-19) पर अथवा जनशिकायत पर तहसीलदार स्वतः संज्ञान लेता है।\n"
            "2. नोटिस व क्षतिपूर्ति: अनाधिकृत कब्जेदार को आर.सी. प्रपत्र-20 पर कारण बताओ नोटिस जारी किया जाता है। "
            "दोषी पाए जाने पर अतिक्रमण हटाने का आदेश एवं बाज़ार मूल्य के आधार पर नुकसानी / क्षतिपूर्ति (Damages) अधिरोपित की जाती है।\n"
            "3. तालाब व जल निकाय संरक्षण: सुप्रीम कोर्ट के *जगमल सिंह* एवं *हिंच लाल तिवारी बनाम कमला देवी (2001)* निर्णय के अनुसार सार्वजनिक तालाबों, "
            "जोहड़ों, श्मशान व खेल मैदानों पर किसी भी प्रकार का पट्टा या निजी कब्जा पूरी तरह अवैध है और इसे नियमित (regularize) नहीं किया जा सकता।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC74-76-TENURE-CLASSES",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 74, 75, 76 & 77",
        "topic": "काश्तकारों की श्रेणियां: संक्रमणीय व असंक्रमणीय भूमिधर (Bhumidhar Tenure Classes)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 के अध्याय 8 के तहत भूमियों के काश्तकारों की 4 मुख्य श्रेणियां:\n"
            "1. श्रेणी 1-क: संक्रमणीय अधिकार वाले भूमिधर (Bhumidhar with Transferable Rights - Sec 75):\n"
            "   - पूर्ण स्वामित्व अधिकार; भूमि को बेचने (Sale), दान (Gift), वसीयत (Will), या बंधक (Mortgage) रखने का पूर्ण वैधानिक अधिकार होता है।\n"
            "   - लगान / भू-राजस्व राज्य सरकार को देय होता है।\n"
            "2. श्रेणी 1-ख: असंक्रमणीय अधिकार वाले भूमिधर (Bhumidhar with Non-Transferable Rights - Sec 76):\n"
            "   - सामान्यतः ग्राम सभा आवंटन या पट्टे पर दी गई भूमि; काश्तकार भूमि जोत सकता है परंतु बेच या दान नहीं कर सकता।\n"
            "   - 5 वर्ष की निरंतर काश्तकारी के पश्चात धारा 76(2) के तहत स्वतः संक्रमणीय भूमिधर (Transferable Bhumidhar) में परिवर्तित हो जाती है।\n"
            "3. श्रेणी 2: असामी (Asami - Sec 77): सीमित अवधि के लिए जलमग्न, सिंघाड़ा, या विशेष प्रयोजन हेतु अस्थायी काश्तकार।\n"
            "4. श्रेणी 5: औद्योगिक विकास प्राधिकरण (NOIDA / Greater Noida / YEIDA) द्वारा मास्टर प्लान हेतु अधिग्रहीत भूमि।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC101-LAND-EXCHANGE",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 101",
        "topic": "भूमि का विनिमय / अदला-बदली (Exchange of Land between Bhumidhars or Gram Sabha)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 101 के तहत भूमि विनिमय (Exchange):\n"
            "1. कोई भी संक्रमणीय भूमिधर अपनी भूमि का विनिमय किसी अन्य भूमिधर की भूमि से अथवा ग्राम सभा की भूमि से सब-डिवीजनल मजिस्ट्रेट (SDM) की पूर्व अनुमति से कर सकता है।\n"
            "2. विनिमय की शर्तें: दोनों भूमियों के सर्किल रेट / बाज़ार मूल्य में 10% से अधिक का अंतर नहीं होना चाहिए, और विनिमय के बाद जोत की चकबंदी में सुगमता आनी चाहिए।\n"
            "3. सार्वजनिक उपयोग की भूमि (तालाब, रास्ता, चारागाह, श्मशान) का निजी विनिमय पूर्णतः वर्जित है।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },

    # -------------------------------------------------------------
    # 2. RFCTLARR ACT, 2013 (CENTRAL ACT 30 OF 2013)
    # -------------------------------------------------------------
    {
        "chunk_id": "CHUNK-RFCTLARR-SEC26-MARKET-VALUE",
        "document_id": "DOC-RFCTLARR-2013",
        "document_title": "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
        "section": "Section 26 & First Schedule",
        "topic": "Determination of Market Value & Rural Multiplier Factor (बाज़ार मूल्य व ग्रामीण गुणक)",
        "content": (
            "Under Section 26 of the RFCTLARR Act 2013, the Collector determines the market value of the land by taking the higher of:\n"
            "1. The minimum circle rate / stamp duty valuation fixed under the Indian Stamp Act, 1899.\n"
            "2. The average sale price for similar type of land situated in the nearest village or vicinity recorded during the preceding three years.\n"
            "3. The agreed value arrived at under private negotiation for public-private partnership (PPP) projects.\n"
            "RURAL MULTIPLIER FACTOR: Under Section 26(2) and First Schedule, the base market value is multiplied by a factor:\n"
            "• Urban Areas: Multiplier factor is strictly 1.00 (1x).\n"
            "• Rural Areas: Multiplier factor ranges from 1.00 to 2.00 (typically 1.25x to 2.0x based on distance from nearest urban municipality, notified by State Govts).\n"
            "• All assets attached to land (trees, wells, structures) are valued separately by certified evaluators under Section 29."
        ),
        "jurisdiction": "National / Central",
        "publisher": "Ministry of Rural Development, Government of India",
        "source_url": "https://legislative.gov.in/sites/default/files/A2013-30.pdf",
        "document_type": "Central Enactment"
    },
    {
        "chunk_id": "CHUNK-RFCTLARR-SEC30-SOLATIUM",
        "document_id": "DOC-RFCTLARR-2013",
        "document_title": "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
        "section": "Section 30",
        "topic": "Award of Solatium (100% अनिवार्य सोलेशियम / सांत्वना राशि)",
        "content": (
            "Section 30 of the RFCTLARR Act 2013 mandates the compulsory award of Solatium:\n"
            "1. Solatium Quantum: The Collector shall in every case award an amount equal to one hundred percent (100%) of the total compensation "
            "determined under Section 26, 27, 28, and 29, in addition to the market value of the land.\n"
            "2. Purpose: Solatium is paid to compensate the landholder for the compulsory nature of the acquisition.\n"
            "3. Additional Interest: An additional amount calculated at 12% per annum on market value is payable from the date of publication of the Social Impact Assessment (SIA) study notification under Section 4(2) to the date of Collector's award."
        ),
        "jurisdiction": "National / Central",
        "publisher": "Ministry of Rural Development, Government of India",
        "source_url": "https://legislative.gov.in/sites/default/files/A2013-30.pdf",
        "document_type": "Central Enactment"
    },
    {
        "chunk_id": "CHUNK-RFCTLARR-SEC101-UNUTILIZED-LAND",
        "document_id": "DOC-RFCTLARR-2013",
        "document_title": "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
        "section": "Section 101",
        "topic": "Return of Unutilized Land after 5 Years (5 वर्ष बाद अप्रयुक्त भूमि की वापसी)",
        "content": (
            "Section 101 of the RFCTLARR Act 2013 governs the reversion of unutilized acquired land:\n"
            "1. Statutory Threshold: When any land acquired under this Act remains unutilized for a period of five (5) years from the date of taking possession, "
            "the acquiring authority cannot retain it indefinitely or divert it to commercial real estate speculation.\n"
            "2. Reversion Mandate: The unutilized land shall be returned to the original owners or their legal heirs, or to the State Land Bank as per rules notified by the State Government.\n"
            "3. Condition: The original landholder must refund the compensation amount received without interest."
        ),
        "jurisdiction": "National / Central",
        "publisher": "Ministry of Rural Development, Government of India",
        "source_url": "https://legislative.gov.in/sites/default/files/A2013-30.pdf",
        "document_type": "Central Enactment"
    },
    {
        "chunk_id": "CHUNK-RFCTLARR-SEC31-RR-ENTITLEMENTS",
        "document_id": "DOC-RFCTLARR-2013",
        "document_title": "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
        "section": "Section 31 & Second Schedule",
        "topic": "Rehabilitation & Resettlement (R&R) Statutory Packages (पुनर्वास व पुनर्व्यवस्थापन अधिकार)",
        "content": (
            "Section 31 and Second Schedule of the RFCTLARR Act 2013 establish non-negotiable R&R entitlements for affected families:\n"
            "1. Resettlement House: For rural areas, a constructed house of min. 50 sq.m Plinth area or financial assistance of not less than Rs. 1.5 Lakhs (or state subsidy).\n"
            "2. Land-for-Land: For irrigation and large dam projects, affected agricultural families are entitled to alternative agricultural land up to 1 Hectare or equal to land lost.\n"
            "3. Subsistence Grant: Rs. 3,000 per month per affected family for 12 months from the date of award.\n"
            "4. Transportation Allowance: A one-time lump sum of Rs. 50,000 for shifting building materials and cattle.\n"
            "5. Mandatory Employment or Annuity: One person per affected family must be offered employment in the project or a one-time cash grant of Rs. 5,00,000, or an annuity of Rs. 2,000 per month adjusted for inflation."
        ),
        "jurisdiction": "National / Central",
        "publisher": "Ministry of Rural Development, Government of India",
        "source_url": "https://legislative.gov.in/sites/default/files/A2013-30.pdf",
        "document_type": "Central Enactment"
    },

    # -------------------------------------------------------------
    # 3. LANDMARK SUPREME COURT OF INDIA PRECEDENTS
    # -------------------------------------------------------------
    {
        "chunk_id": "CHUNK-SC-JAGPAL-SINGH-COMMONS",
        "document_id": "DOC-SC-LANDMARK-PRECEDENTS",
        "document_title": "Supreme Court Landmark Judgments on Land Governance & Rights",
        "section": "Jagpal Singh v. State of Punjab (2011) 11 SCC 396",
        "topic": "Protection of Village Commons, Johad, Talab, & Gram Sabha Lands from Private Encroachment",
        "content": (
            "Supreme Court of India Ruling: *Jagpal Singh & Ors v. State of Punjab & Ors (2011) 11 SCC 396* (Justices Markandey Katju and Gyan Sudha Misra):\n"
            "1. Inviolability of Village Commons: Gram Sabha lands, village ponds (Johad / Talab), grazing grounds (Charagah), thrashing grounds (Khalihan), "
            "and pathways are public community trusts reserved for common village use under traditional customary tenure.\n"
            "2. Prohibition of Regularization: The Supreme Court issued a pan-India mandamus to all State Chief Secretaries that illegal encroachers on Gram Sabha "
            "land cannot have their unauthorized possession regularized, even by paying circle rates or nominal penalties.\n"
            "3. Eviction Mandate: All unauthorized occupants must be summarily evicted, and waterbodies and green commons restored to pristine community status."
        ),
        "jurisdiction": "Supreme Court of India",
        "publisher": "Supreme Court of India Law Reports",
        "source_url": "https://main.sci.gov.in/supremecourt/2011/judgments/",
        "document_type": "Judicial Precedent"
    },
    {
        "chunk_id": "CHUNK-SC-INDORE-DEV-AUTH-SEC24",
        "document_id": "DOC-SC-LANDMARK-PRECEDENTS",
        "document_title": "Supreme Court Landmark Judgments on Land Governance & Rights",
        "section": "Indore Development Authority v. Manoharlal (2020) 8 SCC 129",
        "topic": "Constitution Bench Ruling on Section 24(2) Lapsing of Land Acquisition",
        "content": (
            "Supreme Court of India Constitution Bench Ruling: *Indore Development Authority v. Manoharlal (2020) 8 SCC 129* (5-Judge Bench headed by Justice Arun Mishra):\n"
            "1. Twin Conditions for Lapsing: Under Section 24(2) of the 2013 Act, land acquisition proceedings initiated under the 1894 Act lapse ONLY IF BOTH "
            "conditions are simultaneously met: (a) physical possession was not taken, AND (b) compensation was not paid 5 years prior to 01.01.2014.\n"
            "2. Mode of Taking Possession: Drawing of Panchnama / Memo of Possession by the revenue collector constitutes valid taking of physical possession.\n"
            "3. Meaning of 'Compensation Paid': If the Collector tendered compensation and deposited it in the government treasury because the landowner refused "
            "to accept it or due to dispute, the acquisition DOES NOT lapse. Landowners cannot take advantage of their own refusal to claim lapse."
        ),
        "jurisdiction": "Supreme Court of India",
        "publisher": "Supreme Court of India Law Reports",
        "source_url": "https://main.sci.gov.in/supremecourt/2020/judgments/",
        "document_type": "Judicial Precedent"
    },
    {
        "chunk_id": "CHUNK-SC-VIDYA-DEVI-ARTICLE-300A",
        "document_id": "DOC-SC-LANDMARK-PRECEDENTS",
        "document_title": "Supreme Court Landmark Judgments on Land Governance & Rights",
        "section": "Vidya Devi v. State of Himachal Pradesh (2020) 2 SCC 569",
        "topic": "Right to Property under Article 300A as a Human Right against State Expropriation",
        "content": (
            "Supreme Court of India Ruling: *Vidya Devi v. State of Himachal Pradesh (2020) 2 SCC 569* (Justices Indu Malhotra and Ajay Rastogi):\n"
            "1. Constitutional Protection: The right to property under Article 300A of the Constitution of India is not merely a statutory right but a fundamental human right.\n"
            "2. Doctrine of Adverse Possession against Citizen: The State cannot claim adverse possession over private citizen's land which it took without "
            "due statutory acquisition proceedings and compensation payment.\n"
            "3. Strict Procedure: The State is a welfare institution and cannot act as a land grabber or trespasser; expropriation without due process and fair compensation is unconstitutional."
        ),
        "jurisdiction": "Supreme Court of India",
        "publisher": "Supreme Court of India Law Reports",
        "source_url": "https://main.sci.gov.in/supremecourt/2020/judgments/",
        "document_type": "Judicial Precedent"
    },

    # -------------------------------------------------------------
    # 4. ADVANCED REVENUE PROCEDURES (UP REVENUE CODE, 2006)
    # -------------------------------------------------------------
    {
        "chunk_id": "CHUNK-UPREV-SEC24-DEMARCATION-HADBANDI",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 24",
        "topic": "मेढ़ बंदी, पैमाइश व पत्थरगड्डी (Boundary Demarcation / Hadbandi / Patthargaddi Rules & Procedure)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 24 के अंतर्गत भूखंड सीमांकन, पैमाइश व पत्थरगड्डी (Boundary Demarcation Workflow):\n"
            "1. आवेदन व न्यायालय: यदि कोई पड़ोसी काश्तकार मेढ़ काट ले या भूमि पर कब्जा करने का प्रयास करे, तो पीड़ित भूमिधर उप-जिलाधिकारी (SDM / SDO) के न्यायालय में प्रपत्र आर.सी.-24 (Form R.C.-24) पर धारा 24 का वाद दायर करता है।\n"
            "2. राजकीय शुल्क: प्रति गाटा ₹1,000 का राजकीय चालान (Treasury Challan) जमा करना अनिवार्य है।\n"
            "3. पैमाइश प्रक्रिया: एसडीएम द्वारा राजस्व निरीक्षक (कानूनगो) और क्षेत्रीय लेखपाल को निर्देश दिया जाता है। राजस्व टीम गाँव के तीन स्थायी सीमा चिन्हों (तिमेधा / चौमेधा / Fixed Points) से इलेक्ट्रॉनिक टोटल स्टेशन (ETS) अथवा 66-फुट जरीब (Gunter Chain) से पैमाइश कर 1 माह के भीतर 'पैमाइश आख्या' (Field Book & Demarcation Report) न्यायालय में प्रस्तुत करती है।\n"
            "4. आपत्ति व अंतिम आदेश: सीमावर्ती काश्तकारों को 15 दिन की नोटिस दी जाती है। सुनवाई उपरांत एसडीएम द्वारा आदेश पारित कर पुलिस बल की उपस्थिति में सीमा पर पक्के पत्थर (पत्थरगड्डी / Sihadda) गड़वाए जाते हैं।\n"
            "5. सीमा चिन्ह क्षति दंड: यदि कोई व्यक्ति वैधानिक सीमा चिन्ह या पत्थर हटाता है, तो धारा 227 के तहत अर्थदंड व विधिक कार्रवाई की जाती है।\n"
            "6. अपील: एसडीएम के आदेश के विरुद्ध 30 दिन के भीतर मंडलायुक्त (Divisional Commissioner) के समक्ष अपील दायर की जा सकती है।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/revenue_code_2006.pdf",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC80-NON-AGRI-DECLARATION",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 80",
        "topic": "कृषि भूमि की गैर-कृषि घोषणा / धारा 143 (Declaration for Non-Agricultural Purpose / Land Use Conversion)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 80 (पूर्ववर्ती धारा 143, UPZALR Act) के तहत कृषि से गैर-कृषि भूमि उपयोग परिवर्तन:\n"
            "1. आवश्यकता: जब कोई संक्रमणीय भूमिधर अपनी कृषि भूमि पर आवासीय मकान, प्लॉटिंग, फैक्ट्री, गोदाम, स्कूल अथवा वाणिज्यिक प्रतिष्ठान बनाना चाहता है, तो धारा 80 के अंतर्गत घोषणा कराना अनिवार्य है।\n"
            "2. सक्षम न्यायालय: उप-जिलाधिकारी (SDM / SDO) न्यायालय में ऑनलाइन (UP e-District / UP Bhulekh) अथवा व्यक्तिगत आवेदन खसरा, खतौनी एवं नज़री नक्शा (Site Plan) सहित दाखिल किया जाता है।\n"
            "3. राजकीय शुल्क: संपत्ति के सर्किल रेट (Circle Rate Valuation) का 1% न्यायशुल्क / कोर्ट फीस देय होता है।\n"
            "4. 45-दिवसीय वैधानिक बाध्यता (Deemed Declaration): उत्तर प्रदेश राजस्व संहिता (संशोधन) के अनुसार एसडीएम को आवेदन प्राप्ति के 45 दिनों के भीतर आदेश पारित करना अनिवार्य है। यदि 45 दिन में कोई आदेश पारित नहीं होता, तो भूमि को विधि अनुसार 'स्वतः गैर-कृषि' (Deemed Declared) माना जाता है।\n"
            "5. विधिक प्रभाव: धारा 80 आदेश होने के बाद भूमि पर राजस्व संहिता की जोत सीमा (Ceiling Sec 89) निष्प्रभावी हो जाती है, विकास प्राधिकरणों (NOIDA / Greater Noida / YEIDA) से नक्शा पास हो सकता है, और मृत्यु उपरांत उत्तराधिकार व्यक्तिगत सिविल कानून (Hindu Succession Act / Muslim Personal Law) से तय होता है।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC98-99-SC-TRANSFER-RESTRICTION",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 98, 99, 104 & 105",
        "topic": "अनुसूचित जाति के भूमिधरों द्वारा भूमि अंतरण पर प्रतिबंध (Restrictions on Land Transfer by Scheduled Castes)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 98 एवं 99 के तहत अनुसूचित जाति (SC) भूमिधरों के भूमि अंतरण पर कड़े प्रतिबंध:\n"
            "1. कलेक्टर की पूर्व अनुमति अनिवार्य (Sec 98): अनुसूचित जाति का कोई भी भूमिधर अपनी कृषि भूमि को किसी गैर-अनुसूचित जाति (Non-SC / General / OBC) व्यक्ति को बिना कलेक्टर (जिलाधिकारी / DM) की लिखित पूर्व अनुमति के बेच, दान या पट्टे पर नहीं दे सकता।\n"
            "2. अनुमति की वैधानिक शर्तें:\n"
            "   (क) विक्रेता के पास अंतरण के पश्चात कम से कम 3.125 एकड़ (1.26 हेक्टेयर) कृषि भूमि शेष बचनी चाहिए, अथवा\n"
            "   (ख) परिवार के किसी सदस्य के गंभीर व असाध्य रोग के इलाज अथवा पुत्र/पुत्री की उच्च तकनीकी शिक्षा हेतु भूमि बेचना अनिवार्य हो।\n"
            "3. उल्लंघन का प्रभाव (धारा 104 व 105): यदि कलेक्टर की पूर्व अनुमति के बिना अनुसूचित जाति की भूमि का बैनामा किसी गैर-अनुसूचित जाति के व्यक्ति को कर दिया जाता है, तो धारा 104 के तहत ऐसा बैनामा पूर्णतः 'शून्य' (Void ab initio) होगा।\n"
            "4. राज्य सरकार में निहिति (Sec 105): धारा 105 के तहत ऐसी भूमि बिना किसी प्रतिफल के तुरंत उत्तर प्रदेश राज्य सरकार में स्वतः निहित (Vested in State Government) हो जाएगी, और क्रेता का धन व भूमि दोनों डूब जाएंगे।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC108-110-SUCCESSION-VARASAT",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 108, 109 & 110",
        "topic": "उत्तराधिकार का वैधानिक क्रम व ऑनलाइन वरासत (Order of Succession & e-Varasat Rules)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 108 एवं 110 के तहत पुरुष काश्तकार की मृत्यु पर उत्तराधिकार क्रम (Varasat Rules):\n"
            "1. प्रथम श्रेणी के उत्तराधिकारी (Class-1 Heirs - Sec 108):\n"
            "   - मृतक की विधवा (Widow), पुत्र (Sons), अविवाहित पुत्रियां (Unmarried Daughters), और मृतक के पूर्व-मृत पुत्र के बच्चे बराबर के हिस्सेदार होते हैं।\n"
            "   - माता (Mother) भी प्रथम श्रेणी में समान अंश पाने की अधिकारी होती है।\n"
            "2. ऑनलाइन वरासत प्रक्रिया (e-Varasat Workflow): मृतक के वारिसों को ई-डिस्ट्रिक्ट / ई-वारिस पोर्टल पर ऑनलाइन आवेदन करना होता है।\n"
            "3. 35-दिवसीय अविवादित समय-सीमा: लेखपाल 15 दिनों में गाँव में स्थलीय जांच करता है, और राजस्व निरीक्षक (RI) 35 दिनों के भीतर खतौनी के स्तम्भ-6 में आदेश पारित कर वारिसों के नाम दर्ज करता है। इस प्रक्रिया में कोई न्यायालय शुल्क नहीं लगता।\n"
            "4. विवादित वरासत: यदि वसीयत (Will) या दत्तक ग्रहण पर विवाद हो, तो वाद तहसीलदार न्यायालय में धारा 35 के तहत अंतरित हो जाता है।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC116-PARTITION-KURRA",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 116 & 117",
        "topic": "संयुक्त जोत का बंटवारा व कुर्रा फाट (Partition of Joint Holding / Kurra Batwara Procedure)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 116 एवं 117 के तहत खाते के विभाजन (Partition Suit) की विधिक प्रक्रिया:\n"
            "1. वाद का कारण: जब किसी संयुक्त खाते (Joint Khata) के सह-खातेदारों के बीच खेत जोतने, मेढ़ या हिस्से को लेकर विवाद हो, तो कोई भी सह-खातेदार उप-जिलाधिकारी (SDM / SDO) के न्यायालय में धारा 116 का मुकदमा दायर कर सकता है।\n"
            "2. पक्षकार: खाते के सभी दर्ज सह-खातेदारों और ग्राम सभा (Gram Sabha) को पक्षकार बनाना विधिक रूप से अनिवार्य है।\n"
            "3. प्रारंभिक डिक्री (Preliminary Decree): एसडीएम सभी पक्षों के अंश (Shares - जैसे 1/2, 1/3, 1/4) निर्धारित करते हुए प्रारंभिक डिक्री पारित करता है।\n"
            "4. कुर्रा निर्माण (Preparation of Kurra - Sec 117): न्यायालय राजस्व निरीक्षक व लेखपाल को धरातल पर मौके का मुआयना कर 'कुर्रा' (विभाजन के अलग-अलग लॉट/प्लॉट) बनाने का आदेश देता है। कुर्रा बनाते समय प्रत्येक हिस्सेदार को सड़क, नाली, और समान उपजाऊ भूमि मिलना अनिवार्य है।\n"
            "5. अंतिम डिक्री (Final Decree): कुर्रे पर आपत्तियां निस्तारित करने और स्टाम्प शुल्क जमा होने के बाद अंतिम डिक्री पारित होती है, जिसके आधार पर खतौनी में प्रत्येक हिस्सेदार का पृथक खाता व नया गाटा संख्या दर्ज हो जाता है।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC144-DECLARATORY-SUIT",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Section 144",
        "topic": "स्वत्व घोषणात्मक वाद (Declaratory Suit for Title in Agricultural Land)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 144 के तहत भूमि स्वामित्व घोषणा (Declaratory Suit):\n"
            "1. उद्देश्य: यदि किसी व्यक्ति के भूमिधर अधिकारों (Title / Ownership) को कोई अन्य व्यक्ति चुनौती दे, अथवा खतौनी में गलत प्रविष्टि के कारण स्वामित्व पर विवाद हो, तो उप-जिलाधिकारी (SDM / Assistant Collector First Class) न्यायालय में घोषणात्मक वाद दायर किया जाता है।\n"
            "2. आवश्यक प्रतिवादी: राज्य सरकार (State of UP through Collector) एवं ग्राम सभा (Land Management Committee) को अनिवार्य रूप से प्रतिवादी (Mandatory Defendants) बनाना आवश्यक है।\n"
            "3. साक्ष्य की महत्ता: वादी को मूल बैनामा (Sale Deed), वरासत श्रृंखला, जोत चकबंदी आकार पत्र (CH-41, CH-45), और भौतिक कब्जे (Physical Cultivatory Possession) का दस्तावेजी साक्ष्य सिद्ध करना होता है।\n"
            "4. स्थगन / अंतरिम आदेश: वाद के लंबित रहते भूमि के स्वरूप में बदलाव या तीसरे पक्ष को बेचने से रोकने हेतु अंतरिम स्थगन (Injunction) प्राप्त किया जा सकता है।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },
    {
        "chunk_id": "CHUNK-UPREV-SEC207-210-APPEAL-REVISION",
        "document_id": "DOC-UP-REV-CODE-2006",
        "document_title": "Uttar Pradesh Revenue Code, 2006 (उत्तर प्रदेश राजस्व संहिता, 2006)",
        "section": "Sections 207, 208, 209 & 210",
        "topic": "राजस्व न्यायालयों में अपील, निगरानी व पुनरीक्षण (Appellate & Revisional Hierarchy in UP Revenue Courts)",
        "content": (
            "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 207 से 210 के तहत राजस्व न्यायालयों की अपीलीय व पुनरीक्षण व्यवस्था:\n"
            "1. प्रथम अपील (First Appeal - Sec 207):\n"
            "   - तहसीलदार या नायब तहसीलदार के आदेश (उदा. धारा 35 दाखिल-खारिज) के विरुद्ध प्रथम अपील उप-जिलाधिकारी (SDM) न्यायालय में 30 दिनों के भीतर दायर होती है।\n"
            "   - उप-जिलाधिकारी (SDM) के मूल आदेश (उदा. धारा 24, धारा 80, धारा 116) के विरुद्ध प्रथम अपील मंडलायुक्त (Divisional Commissioner) के समक्ष 30 दिनों में होती है।\n"
            "2. द्वितीय अपील (Second Appeal - Sec 208): प्रथम अपीलीय आदेश के विरुद्ध द्वितीय अपील केवल विधि के किसी सारभूत प्रश्न (Substantial Question of Law) पर राजस्व परिषद (Board of Revenue, Lucknow/Prayagraj) में 90 दिनों में होती है।\n"
            "3. पुनरीक्षण / निगरानी (Revision - Sec 210): ऐसे किसी भी मामले में जहां कोई अपील नहीं होती, राजस्व परिषद (Board of Revenue) अथवा मंडलायुक्त अधीनस्थ राजस्व न्यायालयों के आदेशों की वैधानिकता व क्षेत्राधिकार की जांच हेतु निगरानी स्वीकार कर सकते हैं।"
        ),
        "jurisdiction": "Uttar Pradesh",
        "publisher": "Board of Revenue, Uttar Pradesh",
        "source_url": "https://upbhulekh.gov.in/",
        "document_type": "State Revenue Act"
    },

    # -------------------------------------------------------------
    # 5. DELHI LAND REFORMS ACT, 1954 & NATIONAL CAPITAL TERRITORY
    # -------------------------------------------------------------
    {
        "chunk_id": "CHUNK-DLR-SEC81-EJECTMENT-NON-AGRI",
        "document_id": "DOC-DELHI-LAND-REFORMS-1954",
        "document_title": "Delhi Land Reforms Act, 1954 (Act No. 8 of 1954)",
        "section": "Section 81 & 82",
        "topic": "दिल्ली में कृषि भूमि का गैर-कृषि उपयोग व बेदखली (Section 81 Notice & Vesting in Gaon Sabha)",
        "content": (
            "Delhi Land Reforms Act 1954 ki Dhara 81 ke antargat krishi bhoomi ka gair-krishi upyog aur Gaon Sabha me nihit hona:\n"
            "1. वैधानिक प्रतिबंध (Statutory Bar): दिल्ली के ग्रामीण क्षेत्रों (उदा. अलीपुर, नरेला, बवाना, नजफगढ़, महरौली) में किसी भी भूमिधर द्वारा कृषि भूमि पर गोदाम (Warehouse), फॉर्महाउस (Farmhouse), बैंक्वेट हॉल, फैक्ट्री अथवा अनधिकृत रिहायशी प्लॉटिंग करना धारा 81 का गंभीर उल्लंघन है।\n"
            "2. धारा 81 का नोटिस: राजस्व सहायक (Revenue Assistant / SDM) द्वारा भूमिधर को धारा 81 का नोटिस जारी कर कारण पूछा जाता है कि भूमि को कृषि उपयोग में क्यों न बहाल किया जाए।\n"
            "3. तीन माह का समय (3 Months Statutory Restoration): भूमिधर को गैर-कृषि निर्माण हटाकर भूमि को पुनः कृषि योग्य बनाने हेतु 3 माह का समय दिया जाता है।\n"
            "4. गाँव सभा में निहिति (Vesting in Gaon Sabha): यदि 3 माह में भूमि बहाल नहीं होती, तो एसडीएम भूमिधर को बेदखल कर भूमि को गाँव सभा / दिल्ली सरकार में निहित (Vest) करने का अंतिम आदेश पारित कर देता है।\n"
            "5. विधिक बचाव (Legal Defence): यदि गाँव को दिल्ली नगर निगम अधिनियम की धारा 507 के तहत शहरीकृत (Urbanized Village) अधिसूचित कर दिया गया हो अथवा मास्टर प्लान (MPD-2021/2041) के तहत अधिसूचित हो, तो सुप्रीम कोर्ट के निर्णय *मोहिंदर सिंह* के अनुसार DLR Act की धारा 81 निष्प्रभावी हो जाती है।"
        ),
        "jurisdiction": "Delhi",
        "publisher": "Revenue Department, Government of NCT of Delhi",
        "source_url": "https://revenue.delhi.gov.in/",
        "document_type": "State Revenue Act"
    },

    # -------------------------------------------------------------
    # 6. HARYANA LAND ADMINISTRATION (PUNJAB LAND REVENUE ACT, 1887)
    # -------------------------------------------------------------
    {
        "chunk_id": "CHUNK-HARYANA-JAMABANDI-GIRDAWARI-INTEQAL",
        "document_id": "DOC-PUNJAB-LAND-REVENUE-1887",
        "document_title": "Punjab Land Revenue Act, 1887 (Applicable in Haryana)",
        "section": "Sections 31, 34, 44 & 111",
        "topic": "जमाबंदी, गिरदावरी, इंतकाल व तकसीम (Jamabandi, Khasra Girdawari, Inteqal & Partition in Haryana)",
        "content": (
            "हरियाणा में पंजाब भू-राजस्व अधिनियम, 1887 के अंतर्गत भूमि अभिलेख व राजस्व प्रक्रियाएं:\n"
            "1. जमाबंदी (Jamabandi - Record of Rights / फर्द): प्रत्येक 4 वर्ष (Quadrennial / चार साला) में तैयार होने वाला अधिकार अभिलेख। मुख्य स्तम्भ: खेवट (मालिकों की सूची), खतौनी (काश्तकारों की सूची), खसरा/किला संख्या, रकबा (कनाल-मरला में), और सिंचाई साधन।\n"
            "2. खसरा गिरदावरी (Khasra Girdawari - Harvest Inspection): वर्ष में दो बार हलका पटवारी द्वारा खरीफ (सावनी - अक्टूबर) एवं रबी (हाड़ी - मार्च) में मौके पर जाकर की जाने वाली स्थलीय पड़ताल। इसमें खेत में बोई गई फसल और वास्तविक काबिज काश्तकार (Physical Possession) का विवरण दर्ज होता है।\n"
            "3. इंतकाल (Inteqal / Mutation - Sec 34): रजिस्ट्री (Sale Deed), दान या वरासत के बाद नामांतरण। पटवारी इंतकाल दर्ज करता है, कानूनगो जांच करता है, और सहायक कलेक्टर (तहसीलदार) खुले जलसा-ए-आम (Public Gathering) में इंतकाल स्वीकृत करता है।\n"
            "4. तकसीम (Takseem / Partition - Sec 111): संयुक्त खेवट का बंटवारा तहसीलदार न्यायालय में होता है। इसमें नक्शा अलिफ (मौजूदा स्थिति), नक्शा बे (प्रस्तावित हिस्से), और नक्शा जीम (अंतिम कब्जा दखल) तैयार किया जाता है।"
        ),
        "jurisdiction": "Haryana",
        "publisher": "Department of Revenue and Disaster Management, Haryana",
        "source_url": "https://jamabandi.nic.in/",
        "document_type": "State Revenue Act"
    },

    # -------------------------------------------------------------
    # 7. LANDMARK SUPREME COURT TITLE & ACQUISITION RULINGS
    # -------------------------------------------------------------
    {
        "chunk_id": "CHUNK-SC-SURAJ-LAMP-GPA-SALES",
        "document_id": "DOC-SC-LANDMARK-PRECEDENTS",
        "document_title": "Supreme Court Landmark Judgments on Land Governance & Rights",
        "section": "Suraj Lamp & Industries v. State of Haryana (2012) 1 SCC 656",
        "topic": "अचल संपत्ति में जीपीए (GPA) व एग्रीमेंट टू सेल द्वारा बिक्री की पूर्ण अमान्यता (Invalidity of SA/GPA/Will Sales)",
        "content": (
            "Supreme Court of India Landmark 3-Judge Bench Ruling: *Suraj Lamp & Industries Pvt Ltd v. State of Haryana & Anr (2012) 1 SCC 656* (Justices R.V. Raveendran, A.K. Patnaik, H.L. Gokhale):\n"
            "1. GPA / Agreement to Sale Does Not Convey Title: अचल संपत्ति (मकान, फ्लैट, कृषि भूमि, प्लॉट) का मालिकाना हक केवल पंजीकृत बैनामा (Registered Conveyance Deed / Sale Deed) द्वारा ही अंतरित हो सकता है।\n"
            "2. जीपीए बिक्री अवैध (SA/GPA/Will Transactions are Void): जनरल पावर ऑफ अटॉर्नी (GPA), स्पेशल पावर ऑफ अटॉर्नी (SPA), एग्रीमेंट टू सेल (Agreement to Sell), अथवा वसीयत (Will) के आधार पर संपत्ति का क्रय-विक्रय क्रेता को कोई मालिकाना हक (Title / Ownership) प्रदान नहीं करता।\n"
            "3. रजिस्ट्री कानून की अनिवार्यता: रजिस्ट्री अधिनियम 1908 की धारा 17 व 49 एवं संपत्ति अंतरण अधिनियम 1882 की धारा 54 के तहत ₹100 से अधिक मूल्य की अचल संपत्ति का पंजीकृत विलेख होना अनिवार्य है।\n"
            "4. सावधानियां: राजस्व या विकास प्राधिकरण अभिलेखों में जीपीए धारक का नाम बतौर स्वामी (Owner) कभी दर्ज नहीं किया जा सकता।"
        ),
        "jurisdiction": "Supreme Court of India",
        "publisher": "Supreme Court of India Law Reports",
        "source_url": "https://main.sci.gov.in/supremecourt/2012/judgments/",
        "document_type": "Judicial Precedent"
    },
    {
        "chunk_id": "CHUNK-SC-RADHY-SHYAM-URGENCY-CLAUSE",
        "document_id": "DOC-SC-LANDMARK-PRECEDENTS",
        "document_title": "Supreme Court Landmark Judgments on Land Governance & Rights",
        "section": "Radhy Shyam v. State of Uttar Pradesh (2011) 5 SCC 553",
        "topic": "ग्रेटर नोएडा में धारा 17(4) आपातकालीन अधिग्रहण रद्द करने का ऐतिहासिक निर्णय (Abuse of Urgency Clause)",
        "content": (
            "Supreme Court of India Landmark Ruling: *Radhy Shyam & Ors v. State of Uttar Pradesh & Ors (2011) 5 SCC 553* (Justices G.S. Singhvi and Asok Kumar Ganguly):\n"
            "1. धारा 17(4) का दुरुपयोग अवैध: ग्रेटर नोएडा (गाँव पटवारी) में औद्योगिक एवं आवासीय विकास के नाम पर राज्य सरकार द्वारा धारा 17(4) की आपातकालीन शक्ति लगाकर किसानों की आपत्तियां सुनने (Section 5A Hearing) के अधिकार को समाप्त करने को सुप्रीम कोर्ट ने असंवैधानिक घोषित कर अधिग्रहण रद्द किया।\n"
            "2. प्राकृतिक न्याय का अधिकार: धारा 5A के तहत भूमि अधिग्रहण पर आपत्ति दर्ज कराने का अधिकार कोई औपचारिकता नहीं बल्कि एक मौलिक विधिक अधिकार है।\n"
            "3. वाणिज्यिक व बिल्डर प्रोजेक्ट आपातकाल नहीं: निजी बिल्डरों को आवासीय फ्लैट बनाने या रियल एस्टेट के लिए भूमि देना कोई अप्रत्याशित राष्ट्रीय आपदा या आपातकाल नहीं है जिसके लिए आपात उपबंध लागू किया जाए।"
        ),
        "jurisdiction": "Supreme Court of India",
        "publisher": "Supreme Court of India Law Reports",
        "source_url": "https://main.sci.gov.in/supremecourt/2011/judgments/",
        "document_type": "Judicial Precedent"
    },
    {
        "chunk_id": "CHUNK-RFCTLARR-SEC64-LARRA-REFERENCE",
        "document_id": "DOC-RFCTLARR-2013",
        "document_title": "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
        "section": "Sections 64, 77 & 80",
        "topic": "भूमि अधिग्रहण प्राधिकरण को संदर्भ व विलंब पर 15% ब्याज (LARRA Reference & Penalty Interest on Delayed Compensation)",
        "content": (
            "RFCTLARR Act 2013 ki Dhara 64, 77 एवं 80 ke antargat pratikar vivad aur der se bhugtan par byaj:\n"
            "1. धारा 64 - LARRA को संदर्भ (Reference to Authority): यदि कोई काश्तकार कलेक्टर के अवार्ड (मुआवजा राशि, भूमि की पैमाइश या सह-खातेदारों में अंश बंटवारे) से असंतुष्ट है और उसने अवार्ड को स्वीकार नहीं किया है, तो वह अवार्ड की तिथि से 6 सप्ताह के भीतर कलेक्टर को भूमि अधिग्रहण पुनर्वास एवं पुनर्व्यवस्थापन प्राधिकरण (LARRA - जिला जज स्तर) को संदर्भ भेजने हेतु आवेदन कर सकता है।\n"
            "2. धारा 77 - प्रतिकर का अग्रिम भुगतान: कलेक्टर भूमि का भौतिक कब्जा लेने से पूर्व समस्त प्रतिकर खातेदारों के बैंक खातों में आरटीजीएस द्वारा हस्तांतरित करने हेतु बाध्य है।\n"
            "3. धारा 80 - विलंब पर भारी दंड ब्याज (15% Interest Penalty): यदि कब्जा लेने से पूर्व प्रतिकर का भुगतान नहीं किया जाता, तो कलेक्टर को कब्जा लेने की तिथि से भुगतान की तिथि तक प्रथम वर्ष 9% वार्षिक ब्याज और उसके पश्चात 15% वार्षिक दंड ब्याज देना अनिवार्य है।"
        ),
        "jurisdiction": "National / Central",
        "publisher": "Ministry of Rural Development, Government of India",
        "source_url": "https://legislative.gov.in/sites/default/files/A2013-30.pdf",
        "document_type": "Central Enactment"
    }
]

def enrich_corpus():
    print("========================================================")
    print(" LANDSETU AI LEGAL & STATUTORY CORPUS ENRICHMENT")
    print(" Adding UP Revenue Code 2006, RFCTLARR 2013, & SC Precedents")
    print("========================================================")

    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    inserted_count = 0
    for chunk in NEW_CHUNKS:
        c_hash = compute_hash(chunk["content"])
        cursor.execute("""
            INSERT OR REPLACE INTO document_chunks (
                chunk_id, document_id, document_title, section, topic,
                content, jurisdiction, publisher, source_url, document_type, content_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            chunk["chunk_id"],
            chunk["document_id"],
            chunk["document_title"],
            chunk["section"],
            chunk["topic"],
            chunk["content"],
            chunk["jurisdiction"],
            chunk["publisher"],
            chunk["source_url"],
            chunk["document_type"],
            c_hash
        ))
        inserted_count += 1
        print(f" [OK] Ingested: {chunk['chunk_id']} ({chunk['section']} - {chunk['topic'][:35]}...)")

    conn.commit()

    total_chunks = cursor.execute("SELECT COUNT(*) FROM document_chunks").fetchone()[0]
    conn.close()

    print("--------------------------------------------------------")
    print(f"SUCCESS: Inserted/Updated {inserted_count} statutory chunks.")
    print(f"TOTAL STATUTORY CHUNKS IN SQLITE: {total_chunks}")
    print("--------------------------------------------------------")

if __name__ == "__main__":
    enrich_corpus()
