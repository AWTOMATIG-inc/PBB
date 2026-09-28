POWER BANK BANGLADESH
Quotation Module
Back-Office Developer Specification + Unified 2-Page PDF Output
Objective
Replace manually prepared 3-5 page quotations with one controlled quotation engine that generates a consistent
two-page PDF for any generator brand/model.
1. Functional Goal
Add a Quotation module to the PBB back office. Staff should select a client and qenerator, enter only the commercial
variables, preview the result, and generate a branded PDF. Generator specifications, standard clauses, company
information and signatory data must come from controlled master data.
Primary flow: New Quotation -> Client -> Generator -> Pricing -> Commercial Terms -> Preview -> Finalize -> PDF
2. Data Classification
Type Purpose Examples
Fixed / Global Controlled centrally; normal users do not retype it. PBB branding, address, phones, footer, default clauses,
signatory.
Master Data Reusable records selected during quotation Generator brands/models, engines, alternators, controllers,
creation. standard warranty/scope presets.
Quotation Data Specific to one quotation. Client, subject, quantity, price, discount, VAT/AIT, delivery
and payment terms.
3. Required Back-Office Naviqation
Sales / Quotations: list, search, create, preview, finalize, revise and download quotations.
Clients: client master records.
Products / Generators: generator master records.
Settings / Quotation: branding, numbering, defaults, clauses, presets and signatory.
POWER BANK BANGLADESH - Quotation Module Developer Specification Page 1

Unified PDF Output - Page 1
The qenerated customer-facing quotation must always use this information hierarchy.
A. Header - Fixed
Left Side Right Side
Email: powerbankbd23@gmail.com PBB logo
Address: Kamalapur, Biruliya, Savar, Dhaka Use the approved Power Bank Bangladesh brand artwork.
Phone: +88 (0) 1989 474 447
Phone: +88 (0) 1625 181 403
B. Quotation Metadata
Field Rule
Title QUOTATION FOR SUPPLY OF [CAPACITY] [ENGINE/GENERATOR BRAND] DIESEL GENERATOR
Quotation No. Auto-generated. Recommended: PBB/QTN/YYYY/0001
Date Auto-fill current date; editable before finalization.
Valid Until Auto-calculate from validity period.
Prepared By Logged-in user.
Subject Auto-generated from selected product, but editable.
C. Client Details - Editable
Provide Select Existing Client and + Create New Client. Existing client selection must populate Company, Contact
Person, Designation, Address, Phone and Email. Store a client snapshot in the quotation so later edits to the client master
do not alter historical quotations.
D. Generator / Technical Data
Field Group Fields
Generator Brand, Model, Prime kVA/kW, Standby kVA/kW
Engine Brand, Model, Origin
Alternator Brand, Model, Origin
Controller Brand, Model/Type
Electrical Voltage, Phase, Wire, Frequency, RPM, Power Factor
Commercial Product Data Country of Origin, Shipment Origin, Canopy Type, Fuel Tank, Stock Status
Critical: selecting a generator must populate these values from Generator Master. On quotation creation/finalization, copy
them into a product snapshot. Historical quotations must never change because a master product record was edited
later.
E. Price Summary
SL Description Qty Unit Price (BDT) Total (BDT)
01 Generator Set 1 4,600,000 4,600,000
02 Automatic Transfer Switch (ATS) 1 150,000 150,000
Additional Accessories / Delivery
POWER BANK BANGLADESH - Quotation Module Developer Specification Page 2

| SL | Description | Qty | Unit Price (BDT) | Total (BDT) |
| --- | --- | --- | --- | --- |
|  |  |  | Subtotal | [Auto] |
|  |  |  | VAT / AIT | [Auto] |
|  |  |  | Discount | [Auto] |
|  |  |  | GRAND TOTAL | [Auto] |

System must calculate line totals, subtotal and grand total and automatically generate: In Words: BDT [amount in words]
Only.
POWER BANK BANGLADESH - Quotation Module Developer Specification Page 3

Unified PDF Output - Page 2
Scope, commercial terms, warranty, exclusions and authorization are consolidated on one page.
A. Scope of Supply
Default selectable items: Generator Set; digital controller and accessories; electric starting system; starting
battery/batteries; battery charging system; air/fuel/lube-oil filters; flexible exhaust connector; built-in MCCB; exhaust
silencer; built-in/base fuel tank where applicable; Operation & Maintenance Manual.
Each scope item should support Included/Excluded. Users may add a custom scope line. Admin controls the default list.
B. Commercial Terms
Term Behaviour
Payment Preset + Custom. Initial presets: 100% Advance; 50% Advance / 50% After Shipment; Custom.
Offer Validity Default 30 days; editable.
Delivery Editable / preset (e.g. Ready Stock, Within 60 Days).
Shipping / Transportation Editable; Included / Excluded / At Actual Cost.
Installation & Commissioning Included / Excluded + standard supervision clause.
Warranty Default preset: 12 months or 1,000 running hours, whichever occurs first.
After-Sales Service Included by default; editable clause.
Training Included / Excluded.
VAT & AIT Included / Excluded / calculated values.
C. Standard Exclusions
Admin-controlled default clause covering civil works, cement, sand, bricks, manual labour, power cables, internal wiring,
cable lugs, earthing materials/system, ducting, welding work, nuts and bolts, exhaust extension materials, fuel/diesel,
distilled/de-mineralized water, coolant, lubricating oil and other installation materials unless specifically included.
D. Warranty Exclusions
Default list: improper operation/maintenance; consumable items; normal wear and tear; unauthorized alteration or repair;
and damage outside manufacturer/PBB warranty conditions.
E. Signature Area
For Power Bank Bangladesh
Authorized Signature
Md Tawfikur Rahman
Manager (CEO)
Power Bank Bangladesh
Cell: 01989474447
The signatory should be fixed for normal users but configurable by Admin, including name, title, phone and signature image.
POWER BANK BANGLADESH - Quotation Module Developer Specification Page 4

Quotation Creation UI
Use a short wizard. Avoid exposing the user to the entire database schema in one form.
Step Screen Required Behaviour
1 Client Select existing client or create new. Populate details automatically.
2 Generator Select brand/model. Populate all technical data from Generator Master.
3 Pricing Quantity, unit price, ATS, accessories, delivery charge, VAT, AIT and discount.
4 Commercial Terms Payment, validity, delivery, shipping, warranty, installation, training and notes.
5 Preview Render the actual two-page PDF before finalization.
Actions
Draft: Save Draft | Preview
Final: Finalize Quotation | Generate/Download PDF
After finalization: Duplicate | Create Revision | Mark Sent | Mark Accepted/Rejected
Quotation Status
DRAFT -> FINALIZED -> SENT -> ACCEPTED / REJECTED / EXPIRED
Finalized quotations should not be silently overwritten. If commercial or technical information changes after a quotation has
been sent, create a revision such as PBB/QTN/2026/0042-R1.
Generator Master - Minimum Schema
generator id generator brand generator model prime kva / prime kw standby kva / standby kw engine brand /
engine model / engine origin alternator brand / alternator model / alternator origin controller brand /
controller model / controller type voltage / phase / wire / frequency / rpm / power factor country of origin /
shipment origin canopy type / fuel tank / stock status / default delivery time default description /
default scope / default warranty product image / active
Client Master - Minimum Schema
client_id company_name contact_person designation address phone email BIN_VAT_number (optional) notes created_at
/ updated_at
POWER BANK BANGLADESH - Quotation Module Developer Specification Page 5

Quotation Record & Business Rules
The quotation record is the permanent commercial snapshot used to regenerate the same PDF later.
Recommended Quotation Structure
quotation_id quotation_number quotation_date valid_until status client_snapshot subject quotation_items[]
product_snapshot quantity unit_price accessories[l line_total subtotal discount vat ait delivery_charge
grand total amount in words payment terms delivery terms validity terms warranty terms installation terms
exclusions after sales terms training terms custom notes prepared by created at / updated at
Calculation Rules
Line Total = Quantity x Unit Price
Subtotal = Sum of all line totals
Grand Total = Subtotal + VAT + AIT + Other Charges - Discount
Amount in words must be generated from the final grand total, not manually typed.
Permissions

| Component | Normal User | Admin |
| --- | --- | --- |
| PBB branding/company details | Read only | Edit |
| Client | Select/Create/Edit as permitted | Full control |
| Quotation number | Automatic | Configure sequence/prefix |
| Generator master | Select | Create/Edit/Deactivate |

Quoted technical data Auto-populated Override permission optional
Quantity / Price / ATS / Accessories Edit Edit
Discount / VAT / AIT Edit Edit + configure defaults
Payment / Delivery / Validity Select/Edit Manage presets/defaults

| Warranty / Scope / Exclusions | Use presets | Manage defaults |
| --- | --- | --- |
| Signatory | Read only | Edit |
| PDF layout | Fixed | Template configuration only |

Non-Negotiable Implementation Rules
1. Historical quotations must be immutable after finalization except through a revision workflow.
2. Store client and product snapshots inside the quotation.
3. Do not calculate totals only in the browser; validate/recalculate server-side before finalization.
4. Quotation numbers must be unique and generated server-side.
5. PDF rendering must be deterministic: regenerating a finalized quotation must reproduce the same commercial content.
6. Normal users must not be able to change global PBB branding or standard legal clauses.
POWER BANK BANGLADESH - Quotation Module Developer Specification Page 6

Developer Acceptance Criteria
The feature is complete only when all of the following work end-to-end.
并 Acceptance Test
1 User can create a quotation by selecting an existing client or creating a new client.
2 Selecting a generator model automatically loads its technical specification.
3 User can add ATS, accessories, quantity, delivery charges, VAT/AIT and discount.
4 Subtotal, taxes/charges, discount, grand total and BDT amount-in-words calculate correctly.
5 Payment, delivery, validity, warranty, installation and training terms can use presets and permitted custom values.
6 Preview shows the same two-page layout that will be generated as PDF.
7 Finalized quotation receives a unique quotation number and cannot be silently overwritten.
8 Changing a Client or Generator Master record does not alter an already finalized quotation.
9 Revision workflow creates R1/R2 etc. while retaining the original quotation.
10 Generated PDF contains PBB branding, client data, generator technical data, price summary, terms and authorized signatory.
11 PDF is exactly two pages under normal quotation content. Overflow must be handled deliberately rather than clipping content.
12 Quotation list can be searched by quotation number, client, generator/model, date and status.
Recommended Output Layout
Page 1: PBB header -> quotation metadata -> client -> subject -> generator specification -> price summary -> grand total /
amount in words.
Page 2: scope of supply -> commercial terms -> installation/exclusions -> warranty -> after-sales/training -> notes ->
authorized signature
Design principle: The generator changes; the quotation architecture does not. The same module must support Ricardo,
Perkins, Cummins, CAT, Doosan, Volvo, John Deere and future brands without creating a new quotation template for
each brand.
POWER BANK BANGLADESH - Quotation Module Developer Specification Page 7