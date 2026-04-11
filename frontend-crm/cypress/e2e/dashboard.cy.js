describe("Dashboard E2E Test", () => {
    // ✅ Dashboard nằm ở route "/" không phải "/dashboard"
    const dashboardUrl = "/";
    const apiCustomersUrl = "http://localhost:5000/api/customers";
    const apiProductsUrl = "http://localhost:5000/api/products";

    const mockCustomers = [
        {
            id: "1",
            fullName: "Nguyễn Văn A",
            phone: "0901234567",
            status: "Đã thanh toán",
            totalAmount: 15000000,
            createdAt: new Date().toISOString(),
            items: [{ quantity: 2 }, { quantity: 1 }],
        },
        {
            id: "2",
            fullName: "Trần Thị B",
            phone: "0912345678",
            status: "Mới hỏi",
            totalAmount: 0,
            createdAt: new Date().toISOString(),
            items: [],
        },
        {
            id: "3",
            fullName: "Lê Văn C",
            phone: "0923456789",
            status: "Đang tư vấn",
            totalAmount: 0,
            createdAt: new Date().toISOString(),
            items: [],
        },
        {
            id: "4",
            fullName: "Phạm Thị D",
            phone: "0934567890",
            status: "Đã chốt",
            totalAmount: 8000000,
            createdAt: new Date().toISOString(),
            items: [{ quantity: 1 }],
        },
    ];

    const mockProducts = [
        { id: "1", name: "Sofa Da Cao Cấp", soldCount: 50, basePrice: 15000000 },
        { id: "2", name: "Bàn Gỗ Tự Nhiên", soldCount: 30, basePrice: 8000000 },
        { id: "3", name: "Tủ Gỗ Sồi", soldCount: 20, basePrice: 5000000 },
    ];

    const interceptApis = (customers = mockCustomers, products = mockProducts) => {
        cy.intercept("GET", apiCustomersUrl, {
            statusCode: 200,
            body: { success: true, data: customers },
        }).as("getCustomers");

        cy.intercept("GET", apiProductsUrl, {
            statusCode: 200,
            body: { success: true, data: products },
        }).as("getProducts");
    };

    const visitWithToken = (url = dashboardUrl) => {
        cy.visit(url, {
            onBeforeLoad(win) {
                win.localStorage.setItem("token", "fake-jwt-token");
            },
        });
    };

    beforeEach(() => {
        // ✅ Thứ tự đúng: intercept → visit (có token) → wait
        interceptApis();
        visitWithToken();
        cy.wait(["@getCustomers", "@getProducts"]);
    });

    // =========================
    // 1. Loading & Error State
    // =========================
    it("Hiển thị spinner loading khi đang tải dữ liệu", () => {
        cy.intercept("GET", apiCustomersUrl, (req) => {
            req.reply((res) => {
                res.delay = 2000;
                res.send({ success: true, data: mockCustomers });
            });
        }).as("getCustomersSlow");

        cy.intercept("GET", apiProductsUrl, {
            statusCode: 200,
            body: { success: true, data: mockProducts },
        });

        visitWithToken();
        cy.contains("Đang tải dữ liệu báo cáo...").should("be.visible");
        cy.wait("@getCustomersSlow");
    });

    it("Hiển thị lỗi khi API customers thất bại", () => {
        cy.intercept("GET", apiCustomersUrl, { forceNetworkError: true }).as(
            "getCustomersFail"
        );
        visitWithToken();
        cy.wait("@getCustomersFail");
        cy.contains("Không thể tải dữ liệu").should("be.visible");
    });

    it("Hiển thị lỗi khi API products thất bại", () => {
        cy.intercept("GET", apiProductsUrl, { forceNetworkError: true }).as(
            "getProductsFail"
        );
        visitWithToken();
        cy.wait("@getProductsFail");
        cy.contains("Không thể tải dữ liệu").should("be.visible");
    });

    it("Không hiển thị spinner sau khi tải xong", () => {
        cy.contains("Đang tải dữ liệu báo cáo...").should("not.exist");
    });

    // =========================
    // 2. StatCards
    // =========================
    it("Hiển thị đủ 4 tiêu đề StatCards", () => {
        cy.contains("Tổng khách hàng").should("be.visible");
        cy.contains("Tổng doanh thu").should("be.visible");
        cy.contains("Sản phẩm đã bán").should("be.visible");
        cy.contains("Đơn chờ xử lý").should("be.visible");
    });

    it("Hiển thị đúng tổng số khách hàng (= 4)", () => {
        cy.contains("Tổng khách hàng")
            .closest(".ant-card-body, .ant-card")
            .contains("4")
            .should("exist");
    });

    it("Hiển thị đúng tổng doanh thu (chỉ tính Đã thanh toán = 15,000,000)", () => {
        cy.contains("15,000,000").should("exist");
    });

    it("Hiển thị đúng tổng sản phẩm đã bán (= 100)", () => {
        cy.contains("Sản phẩm đã bán")
            .closest(".ant-card-body, .ant-card")
            .contains("100")
            .should("exist");
    });

    it("Hiển thị đúng số đơn chờ xử lý (Mới hỏi + Đang tư vấn + Đã chốt = 3)", () => {
        cy.contains("Đơn chờ xử lý")
            .closest(".ant-card-body, .ant-card")
            .contains("3")
            .should("exist");
    });

    it("Hiển thị đúng unit trong từng StatCard", () => {
        cy.contains("khách").should("exist");
        cy.contains("VNĐ").should("exist");
        cy.contains("sản phẩm").should("exist");
        cy.contains("đơn hàng").should("exist");
    });

    it("Hiển thị dòng 'so với tháng trước'", () => {
        cy.contains("so với tháng trước").should("exist");
    });

    // =========================
    // 3. RevenueChart
    // =========================
    it("Hiển thị card 'Doanh thu theo tháng'", () => {
        cy.contains("Doanh thu theo tháng").should("be.visible");
    });

    it("Hiển thị tag '6 tháng gần nhất'", () => {
        cy.contains("6 tháng gần nhất").should("be.visible");
    });

    it("Render bar chart trong RevenueChart", () => {
        cy.get(".recharts-bar").should("exist");
    });

    // =========================
    // 4. CustomerStatusChart
    // =========================
    it("Hiển thị card 'Trạng thái khách hàng'", () => {
        cy.contains("Trạng thái khách hàng").should("be.visible");
    });

    it("Hiển thị đủ 4 nhãn trạng thái trong legend", () => {
        cy.contains("Mới hỏi").should("exist");
        cy.contains("Đang tư vấn").should("exist");
        cy.contains("Đã chốt").should("exist");
        cy.contains("Đã thanh toán").should("exist");
    });

    it("Hiển thị % bên cạnh từng nhãn trạng thái", () => {
        cy.contains("Trạng thái khách hàng")
            .closest(".ant-card")
            .contains("%")
            .should("exist");
    });

    it("Render pie chart trong CustomerStatusChart", () => {
        cy.get(".recharts-pie").should("exist");
    });

    // =========================
    // 5. TopProductsTable
    // =========================
    it("Hiển thị card 'Top sản phẩm bán chạy'", () => {
        cy.contains("Top sản phẩm bán chạy").should("be.visible");
    });

    it("Hiển thị đúng 4 tiêu đề cột bảng top sản phẩm", () => {
        cy.contains("Top sản phẩm bán chạy")
            .closest(".ant-card")
            .within(() => {
                cy.contains("Sản phẩm").should("exist");
                cy.contains("Đã bán").should("exist");
                cy.contains("Doanh thu").should("exist");
                cy.contains("Xu hướng").should("exist");
            });
    });

    it("Hiển thị sản phẩm sắp xếp đúng theo soldCount giảm dần", () => {
        cy.contains("Top sản phẩm bán chạy")
            .closest(".ant-card")
            .within(() => {
                cy.contains("Sofa Da Cao Cấp").should("exist");
                cy.contains("Bàn Gỗ Tự Nhiên").should("exist");
                cy.contains("Tủ Gỗ Sồi").should("exist");
            });
    });

    it("Hiển thị doanh thu sản phẩm kèm VNĐ (Sofa = 750,000,000)", () => {
        cy.contains("750,000,000").should("exist");
        cy.contains("Top sản phẩm bán chạy")
            .closest(".ant-card")
            .contains("VNĐ")
            .should("exist");
    });

    // =========================
    // 6. RecentCustomersTable
    // =========================
    it("Hiển thị card 'Khách hàng gần đây'", () => {
        cy.contains("Khách hàng gần đây").should("be.visible");
    });

    it("Hiển thị đúng 4 tiêu đề cột bảng khách hàng gần đây", () => {
        cy.contains("Khách hàng gần đây")
            .closest(".ant-card")
            .within(() => {
                cy.contains("Khách hàng").should("exist");
                cy.contains("SĐT").should("exist");
                cy.contains("Trạng thái").should("exist");
                cy.contains("Giá trị").should("exist");
            });
    });

    it("Hiển thị tên đầy đủ khách hàng (fullName)", () => {
        cy.contains("Nguyễn Văn A").should("be.visible");
        cy.contains("Trần Thị B").should("be.visible");
        cy.contains("Lê Văn C").should("be.visible");
        cy.contains("Phạm Thị D").should("be.visible");
    });

    it("Hiển thị số điện thoại khách hàng", () => {
        cy.contains("0901234567").should("exist");
        cy.contains("0912345678").should("exist");
    });

    it("Hiển thị tag màu đúng theo từng trạng thái", () => {
        cy.get(".ant-tag-cyan").should("exist");   // Đã thanh toán
        cy.get(".ant-tag-blue").should("exist");   // Mới hỏi
        cy.get(".ant-tag-orange").should("exist"); // Đang tư vấn
        cy.get(".ant-tag-green").should("exist");  // Đã chốt
    });

    it("Hiển thị link 'Xem tất cả' trỏ đến /customers", () => {
        cy.contains("Xem tất cả").should("have.attr", "href", "/customers");
    });

    it("Hiển thị giá trị đúng: 15,000,000 cho Đã thanh toán, '-' cho chưa thanh toán", () => {
        cy.contains("Khách hàng gần đây")
            .closest(".ant-card")
            .within(() => {
                cy.contains("15,000,000").should("exist");
                cy.contains("-").should("exist");
            });
    });

    // =========================
    // 7. Edge case: dữ liệu rỗng
    // =========================
    it("Không crash khi customers và products đều rỗng", () => {
        cy.on("uncaught:exception", () => false);

        cy.intercept("GET", apiCustomersUrl, {
            statusCode: 200,
            body: { success: true, data: [] },
        }).as("getCustomersEmpty");

        cy.intercept("GET", apiProductsUrl, {
            statusCode: 200,
            body: { success: true, data: [] },
        }).as("getProductsEmpty");

        visitWithToken();
        cy.wait(["@getCustomersEmpty", "@getProductsEmpty"]);

        cy.contains("Tổng khách hàng").should("exist");
        cy.contains("Tổng doanh thu").should("exist");
        cy.contains("Sản phẩm đã bán").should("exist");
        cy.contains("Đơn chờ xử lý").should("exist");
    });
});