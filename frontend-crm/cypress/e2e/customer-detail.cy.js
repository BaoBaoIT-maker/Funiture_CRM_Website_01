describe("CustomerDetail E2E Test", () => {
    const customerId = 21;
    const detailUrl = `/customers/${customerId}`;
    const customersUrl = "/customers";
    const apiCustomersUrl = "http://localhost:5000/api/customers";
    const apiProductsUrl = "http://localhost:5000/api/products";

    const mockProducts = [
        {
            id: 1,
            name: "Sofa Goc L",
            category: "Ghe sofa",
            basePrice: 15000000,
            soldCount: 5,
        },
        {
            id: 2,
            name: "Ban an 6 ghe",
            category: "Ban",
            basePrice: 5000000,
            soldCount: 8,
        },
    ];

    const mockCustomerDetail = {
        id: customerId,
        fullName: "Pham Gia Han",
        phone: "0909123123",
        email: "han@gmail.com",
        address: "Thu Duc, TP.HCM",
        budget: "Cao cap",
        status: "Đã báo giá",
        notes: "Can bao gia tron bo noi that",
        totalAmount: 25000000,
        customerProducts: [
            {
                productId: 1,
                quantity: 1,
                dealPrice: 15000000,
            },
            {
                productId: 2,
                quantity: 2,
                dealPrice: 5000000,
            },
        ],
    };

    beforeEach(() => {
        cy.loginBypass();

        cy.intercept("GET", apiProductsUrl, {
            statusCode: 200,
            body: { success: true, data: mockProducts },
        }).as("getProducts");

        cy.intercept("GET", `${apiCustomersUrl}/${customerId}`, {
            statusCode: 200,
            body: { success: true, data: mockCustomerDetail },
        }).as("getCustomerDetail");

        cy.visit(detailUrl);
        cy.wait("@getProducts");
        cy.wait("@getCustomerDetail");
    });

    it("Hiển thị chi tiết khách hàng", () => {
        cy.contains(`Chi tiết khách hàng #${customerId}`).should("exist");
        cy.get('input[placeholder="Nguyễn Văn A"]').should("have.value", "Pham Gia Han");
        cy.get('input[placeholder="0901234567"]').should("have.value", "0909123123");
        cy.contains("25.000.000 đ").should("exist");
    });

    it("Tự động tính lại tổng tiền khi thay đổi số lượng", () => {
        cy.get('input[placeholder="SL"]').first().clear().type("2");

        cy.contains("40.000.000 đ").should("exist");
    });

    it("Lưu thay đổi trạng thái khách hàng thành công", () => {
        const updatedCustomer = {
            ...mockCustomerDetail,
            status: "Đã thanh toán",
            notes: "Da chot thanh toan va gui email",
            totalAmount: 25000000,
        };

        cy.intercept("PUT", `${apiCustomersUrl}/${customerId}`, (req) => {
            expect(req.body.status).to.equal("Đã thanh toán");
            expect(req.body.products).to.have.length(2);

            req.reply({
                statusCode: 200,
                body: { success: true, data: updatedCustomer },
            });
        }).as("saveCustomerDetail");

        cy.intercept("GET", `${apiCustomersUrl}/${customerId}`, {
            statusCode: 200,
            body: { success: true, data: updatedCustomer },
        }).as("refetchCustomerDetail");

        cy.contains("label", "Trạng thái")
            .parents(".ant-form-item")
            .find(".ant-select")
            .click();
        cy.contains(".ant-select-item-option-content", "Đã thanh toán").click();

        cy.get('textarea[placeholder="Nhu cầu, ghi chú bảo hành..."]')
            .clear()
            .type("Da chot thanh toan va gui email");

        cy.contains("button", "Lưu thay đổi").click();

        cy.wait("@saveCustomerDetail");
        cy.wait("@refetchCustomerDetail");

        cy.contains("Lưu thông tin khách hàng thành công").should("exist");
        cy.contains("Đã thanh toán").should("exist");
    });

    it("Quay lại danh sách khách hàng", () => {
        cy.intercept("GET", apiCustomersUrl, {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {
                        id: customerId,
                        fullName: mockCustomerDetail.fullName,
                        phone: mockCustomerDetail.phone,
                        email: mockCustomerDetail.email,
                        budget: mockCustomerDetail.budget,
                        totalAmount: mockCustomerDetail.totalAmount,
                        status: mockCustomerDetail.status,
                        customerProducts: mockCustomerDetail.customerProducts,
                    },
                ],
            },
        }).as("backToCustomers");

        cy.contains("button", "Quay lại danh sách").click();
        cy.wait("@backToCustomers");

        cy.url().should("include", customersUrl);
        cy.contains("Pham Gia Han").should("exist");
    });
});
