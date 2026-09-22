POWER BANK BANGLADESH | WEBSITE + BACKEND DEVELOPMENT

# POWER BANK BANGLADESH

## Website + Backend Development Total Feedback & Implementation Breakdown

##### Live Website: www.powerbankbangladesh.com

##### Post-launch development scope after client feedback

##### Project Positioning

The current website is already live. This document defines the complete post-feedback implementation scope, covering public website corrections, catalogue expansion, product-management logic, pricing controls, customer and quotation workflows, invoice automation, PDF document generation, and production QA.

##### Prepared by AWTOMATIG

##### September 2026

Prepared by AWTOMATIG | Project Breakdown

# 1. Executive Summary

The Power Bank Bangladesh website has progressed beyond a simple company website. The latest feedback requires the platform to operate as a structured generator catalogue and a lightweight internal sales-management system. The development scope therefore includes both customer-facing changes and backend business logic.

##### Core Outcome

A production-ready platform where Power Bank Bangladesh can manage generator products up to 1500 kVA, maintain real product imagery and optional pricing, publish all catalogue models, create quotations, convert approved quotations into invoices, and generate printable/downloadable commercial documents without developer intervention.

# 2. Master Development Backlog

|ID|Area|Task|Type|Priority|
|---|---|---|---|---|
|PBB-01|Product Filtering|Expand generator range to 1500 kVA|Front + Back|Critical|
|PBB-02|Product Filtering|Rework Power Band categories and filters|Front + Back|High|
|PBB-03|Clients|Add approved client portfolio|Front + CMS|High|
|PBB-04|Contact|Keep only two approved phone numbers|Front + CMS|Critical|
|PBB-05|WhatsApp|Set approved WhatsApp Business number|Front|High|
|PBB-06|Services|Replace Buy with Exchange across site|Front + CMS|High|
|PBB-07|Catalogue|Redesign product/category catalogue|Front|Critical|
|PBB-08|Catalogue|Import every product from Grand Power brochure|Back + CMS|Critical|
|PBB-09|Products|Add optional product pricing|Back + Front|Critical|
|PBB-10|Products|Auto-hide price area when no price exists|Back + Front|Critical|
|PBB-11|Products|Use actual product/model photographs|Content + CMS|Critical|
|PBB-12|Admin|Manage products, specs, images and pricing from backend|Back|Critical|
|PBB-13|Quotation|Build automated quotation generator|Back + Front|Critical|
|PBB-14|Quotation|Match supplied quotation structures and business rules|Back|Critical|
|PBB-15|Invoice|Build invoice generation and status|Back|Critical|

handling

|||Generate|||
|---|---|---|---|---|
|||printable/downloadable|||
|PBB-16|Documents|quotation and invoice|Back|Critical|
|||PDFs|||

Responsive testing after PBB-17 QA QA High catalogue redesign Complete catalogue and PBB-18 QA QA High data reconciliation Quotation/invoice PBB-19 QA calculation and PDF QA Critical

|PBB-19|QA|calculation and PDF|QA|Critical|
|---|---|---|---|---|
|||validation|||

# 3. Immediate Live-Site Corrections

## 3.1 Generator Power Range

The current power-band system must be expanded to support generator inventory up to 1500 kVA.

|Power Band|Recommended Range|
|---|---|
|Small|Under 50 kVA|
|Medium|50-149 kVA|
|Large|150-299 kVA|
|Industrial|300-749 kVA|
|Heavy Industrial|750-1500 kVA|

Implementation requirement: power capacity should be stored numerically in the database and filters should be derived from product data rather than hard-coded product cards.

## 3.2 Approved Client Portfolio

- Skyview Apartment
- Bashundhara Training and Testing
- Bay Footwear
- Adib Builders
- Sinha Knitwear
- Atif Agro
- Magura Group Recommended CMS fields: Client Name, Logo, Display Order, Featured Yes/No, Active/Hidden.
## 3.3 Contact Numbers

|Purpose|Approved Number|
|---|---|
|WhatsApp Business|+88 (0) 1989 474 447|
|Telephone|+88 (0) 1625 181 403|

All other phone numbers must be removed from the header, footer, contact page, CTA buttons, mobile menus, structured data, schema markup, metadata, WhatsApp components and any hard-coded links.

## 3.4 Service Terminology

Replace the current Buy service with Exchange throughout the website. The service should be presented as Generator Exchange, where an existing generator may be assessed and exchanged toward another available unit, subject to inspection and valuation.

# 4. Product Catalogue Redesign

The new product catalogue should be structured as a genuine commercial generator catalogue rather than a static collection of cards. The supplied PS Engineering category page is the design reference, while the final implementation should preserve Power Bank Bangladesh branding and backend requirements.

## 4.1 Recommended Catalogue Filters

- Brand: Cummins, Perkins, Ricardo, John Deere, Volvo Penta, Deutz, Doosan, Caterpillar and other approved brands.
- Power Band: Small, Medium, Large, Industrial and Heavy Industrial.
- kVA Range: minimum and maximum capacity.
- Condition: New, Reconditioned or Used.
- Availability: Available or Contact for Availability.
- Price State: Price Available or Request Price.
- Optional application tags: Commercial, Industrial, Construction, Standby or Prime Power.
## 4.2 Product Database Structure

- Product Name
- Model
- Generator Brand
- Engine Brand
- Engine Model
- Prime Power kVA
- Prime Power kW
- Standby Power kVA
- Standby Power kW
- Alternator
- Controller
- Frequency
- Voltage
- Fuel Type
- Fuel Consumption
- Fuel Tank Capacity
- Dimensions
- Weight
- Country of Origin
- Condition
- Price
- Currency
- Stock / Availability
- Main Product Image

- Additional Images
- Brochure / Data Sheet
- Description
- Technical Specifications
- Featured Product
- Published / Draft
## 4.3 Grand Power Catalogue Migration

Every generator/model contained in the supplied GRAND POWER LTD brochure must be represented in the product section. This is a reconciliation task, not a sample import.

1. Identify every generator/model in the brochure.
2. Extract model names and technical specifications.
3. Create each product in the backend.
4. Assign brand and engine information.
5. Store kVA values numerically.
6. Assign the correct power band.
7. Add genuine/actual product imagery.
8. Add technical specifications.
9. Add pricing where supplied or approved.
10. Attach brochure/datasheet where appropriate.
11. Publish the product.
12. Validate final product count and model list against the brochure.
##### Reconciliation Rule

Brochure products = Backend products = Published catalogue products. No silent omissions.

## 4.4 Product Photography

All published products must use the actual generator or model photograph. Generic stock images should not be used as if they represent a specific model. Each product should support one primary image and an optional gallery.

## 4.5 Optional Pricing Logic

Pricing must be optional. If no price has been added by an administrator, the pricing area should be completely hidden and the primary commercial action should become Request Quotation. **Backend Field Behavior** price Numeric value or null currency BDT by default unless otherwise configured showPrice Boolean visibility control No price / disabled Hide pricing block entirely Price active Show formatted price on product page

## 4.6 Individual Product Page

- Actual product photograph and optional gallery.
- Brand, model, prime/standby kVA and availability.

- Conditional price display.
- Request Quotation, WhatsApp and Call CTAs.
- Technical specifications: engine, alternator, controller, power, voltage, frequency, fuel data, dimensions, weight and other model data.
- Downloads: product brochure and technical datasheet.
- Related generators based on brand and adjacent power range.
# 5. Backend / Admin Architecture

The backend should centralize editable business information and remove the need for recurring developer intervention for normal catalogue and sales administration.

- Dashboard
- Products: Products, Brands, Categories, Power Bands, Product Images
- Customers
- Quotations: Create, Draft, Sent, Accepted, Rejected, Expired
- Invoices: Draft, Issued, Partially Paid, Paid, Overdue, Cancelled
- Clients / Portfolio
- Website Content
- Settings: Company Information, Contact Numbers, WhatsApp, Quotation Settings, Invoice Settings, Terms & Conditions
# 6. Automated Quotation System

The supplied quotation samples-including the Bashundhara Training and Testing Center quotation and the Ricardo 40 kVA quotation-should define the commercial structure, terminology and output layout of the automated quotation module.

## 6.1 Quotation Workflow

13. Create a new quotation.
14. Select an existing customer or create a new customer.
15. Add one or more generator products.
16. Auto-populate product/model/specification information.
17. Enter quantity.
18. Load or override unit price where permitted.
19. Add accessories, installation, transportation or other commercial items.
20. Apply discount and VAT/tax when applicable.
21. Set payment terms, delivery terms, warranty and quotation validity.
22. Generate a unique quotation number.
23. Preview the complete quotation.
24. Generate a printable/downloadable PDF.
25. Save quotation status and history.
## 6.2 Quotation Data Model

- Quotation Number
- Quotation Date
- Validity Date

- Customer
- Company
- Contact Person
- Phone
- Email
- Address
- Products
- Quantity
- Unit Price
- Line Total
- Accessories
- Installation
- Transport
- Other Charges
- Subtotal
- Discount
- VAT / Tax
- Grand Total
- Payment Terms
- Delivery Terms
- Warranty
- Validity
- Notes
- Prepared By
- Approved By
- Status Recommended statuses: Draft, Sent, Accepted, Rejected, Expired, Converted to Invoice.
## 6.3 Quotation Numbering

Quotation numbers should be generated sequentially by the backend and protected against duplication. The exact numbering convention should match PBB's historical commercial records, for example PBB-1095, PBB-1096, PBB-1097, etc.

# 7. Invoice Automation

Invoices should be generated from accepted quotations whenever possible. This avoids duplicate data entry and preserves traceability between the original offer and final billing document.

## 7.1 Quotation-to-Invoice Workflow

26. Client accepts quotation.
27. Administrator selects Convert to Invoice.
28. Customer details are copied automatically.
29. Product and line-item details are copied.
30. Commercial values and terms are copied.
31. System creates the next invoice number.
32. Administrator adjusts values only if required.
33. Invoice PDF is generated and stored.

## 7.2 Invoice Data Model

- Invoice Number
- Reference Quotation
- Invoice Date
- Due Date
- Customer
- Products
- Quantity
- Unit Price
- Subtotal
- Discount
- VAT / Tax
- Total
- Amount Paid
- Balance
- Payment Status
- Payment Method
- Payment Notes Recommended statuses: Draft, Issued, Partially Paid, Paid, Overdue, Cancelled.
## 7.3 Commercial Document Output

- Quotation and invoice documents must be suitable for print and digital delivery.
- Output should include PBB branding, business information and approved contact details.
- PDF generation must preserve tables, totals and page breaks.
- Commercial totals must be calculated server-side or through a consistent validated calculation layer.
- Generated documents should be retrievable from the associated quotation/invoice record.
# 8. Recommended Delivery Sequence

|Sprint|Scope|Key Output|
|---|---|---|
|Sprint 1|PBB-01 to PBB-06|Live-site corrections: range, client list, numbers, WhatsApp, Exchange terminology|
|Sprint 2|PBB-07 to PBB-12|Catalogue redesign, product schema, brochure import, imagery and optional pricing|
|Sprint 3|PBB-13 to PBB-16|Customer records, quotation automation, invoice automation and PDF generation|
|Sprint 4|PBB-17 to PBB-19|Responsive QA, catalogue reconciliation, commercial calculation/PDF validation|

# 9. QA & Acceptance Checklist

- Desktop, tablet and mobile responsive behavior.
- Power filtering supports the full 0-1500 kVA range.
- All approved clients display correctly.

- Only the two approved contact numbers exist across the entire production site.
- WhatsApp CTA uses the approved WhatsApp Business number.
- Buy has been replaced by Exchange where applicable.
- All Grand Power brochure models are present in production.
- Every published product has accurate specifications.
- Every published product has an actual/correct product image.
- Products without prices do not render an empty or zero-price block.
- Product CRUD works from the admin backend.
- Customer CRUD works from the admin backend.
- Quotation calculations are validated.
- Quotation numbering cannot duplicate.
- Quotation PDF output is visually correct.
- Quotation can convert into invoice.
- Invoice calculations and balances are validated.
- Invoice numbering cannot duplicate.
- Invoice PDF output is visually correct.
- Print layout and page breaks are validated.
# 10. Definition of Done

34. Every product from the supplied Grand Power brochure exists in the production catalogue.
35. Every published generator has the correct actual product/model photograph.
36. The public catalogue supports generators through 1500 kVA.
37. A product may have a price or no price without breaking the interface.
38. PBB staff can create or select a customer, build a quotation, generate the quotation PDF and manage quotation status without developer assistance.
39. An accepted quotation can be converted into an invoice without re-entering customer and product information.
40. Generated quotation and invoice outputs match PBB's commercial document structure and are suitable for sending to customers.
41. The production website passes responsive, catalogue, data and commercial-workflow QA.
# 11. Project Scope Interpretation

Following this feedback, the Power Bank Bangladesh project should be managed as a hybrid website and internal sales platform. The public layer is responsible for company presentation, generator discovery and lead conversion. The backend layer is responsible for catalogue administration, customer records, quotations, invoices and document generation.

##### Scope Classification

This is no longer only a brochure website. It is a product catalogue plus lightweight sales-operations application. The quotation and invoice components should therefore be developed, reviewed and tested using software-product standards rather than treated as simple content additions.

# 12. Final Deliverables

- Updated production website with all approved public-facing corrections.
- Expanded 0-1500 kVA product catalogue experience.
- Complete Grand Power product migration.
- Backend product and catalogue management.
- Real product image implementation.
- Optional product pricing system.
- Customer database.
- Automated quotation generation.
- Quotation PDF generation.
- Quotation-to-invoice conversion.
- Invoice management and PDF generation.
- Final responsive, catalogue and commercial-workflow QA.
##### END OF DEVELOPMENT BREAKDOWN