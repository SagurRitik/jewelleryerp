export const generateTallySalesXML = (invoice) => {
  return `
  <ENVELOPE>
    <HEADER>
      <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
      <IMPORTDATA>
        <REQUESTDESC>
          <REPORTNAME>Vouchers</REPORTNAME>
        </REQUESTDESC>
        <REQUESTDATA>
          <TALLYMESSAGE>
            <VOUCHER VCHTYPE="Sales" ACTION="Create">
              <DATE>${new Date(invoice.date || invoice.createdAt)
                .toISOString()
                .slice(0,10)
                .replace(/-/g, "")}</DATE>
              
              <VOUCHERNUMBER>${invoice.invoiceNo}</VOUCHERNUMBER>
              
              <PARTYNAME>${invoice.customer.name}</PARTYNAME>
              
              <ALLLEDGERENTRIES.LIST>
                <LEDGERNAME>Sales</LEDGERNAME>
                <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                <AMOUNT>${invoice.totals.grandTotal}</AMOUNT>
              </ALLLEDGERENTRIES.LIST>

              <ALLLEDGERENTRIES.LIST>
                <LEDGERNAME>Cash</LEDGERNAME>
                <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                <AMOUNT>-${invoice.totals.grandTotal}</AMOUNT>
              </ALLLEDGERENTRIES.LIST>

            </VOUCHER>
          </TALLYMESSAGE>
        </REQUESTDATA>
      </IMPORTDATA>
    </BODY>
  </ENVELOPE>
  `;
};
