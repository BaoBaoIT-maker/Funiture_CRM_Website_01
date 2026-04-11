describe("Customers E2E Test", () => {
    const customersUrl = "/customers";
    const apiCustomersUrl = "http://localhost:5000/api/customers";
    const apiProductsUrl = "http://localhost:5000/api/products";

    const mockProducts = [
        {
            id: 1,
            name: "Sofa Goc L",
            category: "Ghe sofa",
            basePrice: 12000000,
            soldCount: 5,
        },
        {
            id: 2,
            name: "Ban an 6 ghe",
            category: "Ban",
            basePrice: 8000000,
            soldCount: 2,
        },
    ];

    const mockCustomers = [
        {
            id: 1,
            fullName: "Nguyen Van Minh",
            phone: "0901234567",
            email: "minh@gmail.com",
            budget: "Cao cap",
            totalAmount: 12000000,
            status: "Đang tư vấn",
            customerProducts: [
                {
                    productId: 1,
                    quantity: 1,
                    dealPrice: 12000000,
                },
            ],
        },
        {
            id: 2,
            fullName: "Tran Thi Lan",
            phone: "0988888888",
            email: "lan@gmail.com",
            budget: "Tieu chuan",
            totalAmount: 16000000,
            status: "Đã báo giá",
            customerProducts: [
                {
                    productId: 2,
                    quantity: 2,
                    dealPrice: 8000000,
                },
            ],
        },
    ];

    function openCreateCustomerModal() {
        cy.contains("button", "Thêm khách hàng").click();
        cy.get(".ant-modal:visible", { timeout: 10000 }).should("have.length.at.least", 1);
        cy.contains(".ant-modal-title", "Tạo khách hàng và chi tiết đơn hàng", { timeout: 10000 })
            .should("exist");
    }

    function getCreateCustomerModal() {
        return cy.get(".ant-modal:visible").last();
    }

    function fillCustomerForm() {
        getCreateCustomerModal().within(() => {
            cy.get('input[placeholder="Nguyễn Văn A"]').type("Le Hoang Bao");
            cy.get('input[placeholder="0901234567"]').type("0911222333");
            cy.get('input[placeholder="khachhang@gmail.com"]').type("bao@gmail.com");
        });

        getCreateCustomerModal()
            .contains(".ant-card", "Chi tiết sản phẩm khách chọn")
            .find(".ant-select")
            .first()
            .click();
        cy.contains(".ant-select-item-option-content", "Sofa Goc L").click();

        getCreateCustomerModal().find('input[placeholder="SL"]').clear().type("2");
        getCreateCustomerModal().find('input[placeholder="Giá chốt"]').clear().type("13000000");
    }

    beforeEach(() => {
        cy.loginBypass();

        cy.intercept("GET", apiCustomersUrl, {
            statusCode: 200,
            body: { success: true, data: mockCustomers },
        }).as("getCustomers");

        cy.intercept("GET", apiProductsUrl, {
            statusCode: 200,
            body: { success: true, data: mockProducts },
        }).as("getProducts");

        cy.visit(customersUrl);
        cy.wait("@getCustomers");
        cy.wait("@getProducts");
    });

    it("Hiển thị danh sách khách hàng", () => {
        cy.contains("Nguyen Van Minh").should("exist");
        cy.contains("Tran Thi Lan").should("exist");
        cy.contains("button", "Thêm khách hàng").should("be.visible");
    });

    it("Tìm kiếm và lọc khách hàng theo trạng thái", () => {
        cy.get('input[placeholder="Tìm theo tên hoặc SĐT..."]').type("Lan");
        cy.contains("Tran Thi Lan").should("exist");
        cy.contains("Nguyen Van Minh").should("not.exist");

        cy.get('input[placeholder="Tìm theo tên hoặc SĐT..."]').clear();
        cy.get(".ant-select").first().click();
        cy.contains(".ant-select-item-option-content", "Đã báo giá").click();

        cy.contains("Tran Thi Lan").should("exist");
        cy.contains("Nguyen Van Minh").should("not.exist");
    });

    it("Mở form tạo khách hàng và tự động tính tổng tiền", () => {
        openCreateCustomerModal();
        fillCustomerForm();

        getCreateCustomerModal().contains(/26[.,]000[.,]000 đ/).should("exist");
    });

    it("Tạo khách hàng thành công và chuyển sang trang chi tiết", () => {
        const createdCustomer = {
            id: 99,
            fullName: "Le Hoang Bao",
            phone: "0911222333",
            email: "bao@gmail.com",
            address: "Quan 1, TP.HCM",
            budget: "Cao cap",
            totalAmount: 26000000,
            status: "Đang tư vấn",
            notes: "Can tu van sofa phong khach",
            customerProducts: [
                {
                    productId: 1,
                    quantity: 2,
                    dealPrice: 13000000,
                },
            ],
        };

        cy.intercept("POST", apiCustomersUrl, (req) => {
            expect(req.body.fullName).to.equal("Le Hoang Bao");
            expect(req.body.phone).to.equal("0911222333");
            expect(req.body.products).to.have.length(1);
            expect(req.body.products[0].productId).to.equal(1);
            expect(req.body.products[0].quantity).to.equal(2);
            expect(req.body.products[0].dealPrice).to.equal(13000000);

            req.reply({
                statusCode: 200,
                body: { success: true, data: { id: 99 } },
            });
        }).as("createCustomer");

        cy.intercept("GET", apiCustomersUrl, {
            statusCode: 200,
            body: { success: true, data: [...mockCustomers, createdCustomer] },
        }).as("refreshCustomers");

        cy.intercept("GET", `${apiCustomersUrl}/99`, {
            statusCode: 200,
            body: { success: true, data: createdCustomer },
        }).as("getCustomerDetail");

        openCreateCustomerModal();

        getCreateCustomerModal().within(() => {
            cy.get('input[placeholder="Nguyễn Văn A"]').type("Le Hoang Bao");
            cy.get('input[placeholder="0901234567"]').type("0911222333");
            cy.get('input[placeholder="khachhang@gmail.com"]').type("bao@gmail.com");
            cy.get('input[placeholder="Quận 1, TP.HCM"]').type("Quan 1, TP.HCM");
            cy.get('textarea[placeholder="Ghi chú nhu cầu của khách"]').type("Can tu van sofa phong khach");
        });

        getCreateCustomerModal()
            .contains(".ant-form-item", "Ngân sách")
            .find(".ant-select")
            .click();
        cy.contains(".ant-select-item-option-content", "Cao cap").click();

        getCreateCustomerModal()
            .contains(".ant-form-item", "Trạng thái")
            .find(".ant-select")
            .click();
        cy.contains(".ant-select-item-option-content", "Đang tư vấn").click();

        getCreateCustomerModal()
            .contains(".ant-card", "Chi tiết sản phẩm khách chọn")
            .find(".ant-select")
            .first()
            .click();
        cy.contains(".ant-select-item-option-content", "Sofa Goc L").click();

        getCreateCustomerModal().find('input[placeholder="SL"]').clear().type("2");
        getCreateCustomerModal().find('input[placeholder="Giá chốt"]').clear().type("13000000");

        cy.contains("button", "Lưu khách hàng").click();

        cy.wait("@createCustomer");
        cy.wait("@refreshCustomers");
        cy.wait("@getCustomerDetail");

        cy.url().should("include", "/customers/99");
        cy.contains("Chi tiết khách hàng #99").should("exist");
    });
});
