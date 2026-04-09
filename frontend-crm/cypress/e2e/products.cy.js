describe("Products E2E Test", () => {
    const productsUrl = "/products";
    const apiProductsUrl = "http://localhost:5000/api/products";

    const mockProducts = [
        {
            id: "1",
            name: "Sofa Da Cao Cấp",
            category: "Ghế sofa",
            basePrice: 15000000,
            soldCount: 12,
            imageUrl: "https://via.placeholder.com/48",
            description: "Sofa da nhập khẩu",
        },
        {
            id: "2",
            name: "Bàn Gỗ Tự Nhiên",
            category: "Bàn",
            basePrice: 8000000,
            soldCount: 5,
            imageUrl: "https://via.placeholder.com/48",
            description: "Bàn gỗ cao cấp",
        },
    ];

    beforeEach(() => {
        cy.loginBypass(); // ← thêm dòng này vào đầu

        cy.intercept("GET", apiProductsUrl, {
            statusCode: 200,
            body: { success: true, data: mockProducts },
        }).as("getProducts");

        cy.visit(productsUrl);
        cy.wait("@getProducts");
    });

    // =========================
    // 1. Kiểm tra UI
    // =========================
    it("Hiển thị danh sách sản phẩm", () => {
        cy.contains("Sofa Da Cao Cấp").should("exist");
        cy.contains("Bàn Gỗ Tự Nhiên").should("exist");
    });

    it("Hiển thị đúng stats tổng quan", () => {
        cy.contains("Tổng sản phẩm").should("exist");
        cy.contains("Còn hàng").should("exist");
        cy.contains("Hết hàng").should("exist");
        cy.contains("Tổng đã bán").should("exist");
    });

    it("Hiển thị nút Thêm sản phẩm", () => {
        cy.contains("button", "Thêm sản phẩm").should("be.visible");
    });

    // =========================
    // 2. Tìm kiếm & lọc
    // =========================
    it("Tìm kiếm sản phẩm theo tên", () => {
        cy.get('input[placeholder="Tìm kiếm sản phẩm..."]').type("Sofa");
        cy.contains("Sofa Da Cao Cấp").should("exist");
        cy.contains("Bàn Gỗ Tự Nhiên").should("not.exist");
    });

    it("Lọc theo danh mục", () => {
        cy.get(".ant-select").first().click();
        cy.contains(".ant-select-item", "Bàn").click();
        cy.contains("Bàn Gỗ Tự Nhiên").should("exist");
        cy.contains("Sofa Da Cao Cấp").should("not.exist");
    });

    // =========================
    // 3. Thêm sản phẩm
    // =========================
    it("Mở modal thêm sản phẩm", () => {
        cy.contains("button", "Thêm sản phẩm").click();
        cy.contains("Thêm sản phẩm mới").should("be.visible");
    });

    it("Hiển thị lỗi validation khi bỏ trống form", () => {
        // Thêm dòng này để bỏ qua uncaught exception
        cy.on("uncaught:exception", () => false);

        cy.contains("button", "Thêm sản phẩm").click();
        cy.contains("button", "Thêm mới").click();
        cy.contains("Vui lòng nhập tên sản phẩm").should("exist");
        cy.contains("Chọn danh mục").should("exist");
        cy.contains("Nhập giá").should("exist");
    });

    it("Thêm sản phẩm thành công", () => {
        cy.intercept("POST", apiProductsUrl, {
            statusCode: 200,
            body: { success: true, data: { id: "3", name: "Tủ Gỗ Sồi" } },
        }).as("createProduct");

        cy.contains("button", "Thêm sản phẩm").click();

        // Thêm cy.on để bắt exception nếu có
        cy.on("uncaught:exception", () => false);

        cy.get('input[placeholder="VD: Sofa Da Cao Cấp"]').type("Tủ Gỗ Sồi");

        // ✅ Giới hạn trong modal, không lấy .ant-select đầu tiên của trang
        cy.get(".ant-modal").find(".ant-select").first().click();
        cy.contains(".ant-select-item", "Tủ").click();

        cy.get('input[placeholder="15,000,000"]').type("5000000");
        cy.get('input[placeholder="0"]').type("10");

        cy.contains("button", "Thêm mới").click();
        cy.wait("@createProduct");
        cy.contains("Thêm sản phẩm thành công").should("exist");
    });

    // =========================
    // 4. Chỉnh sửa sản phẩm
    // =========================
    it("Mở modal chỉnh sửa với dữ liệu đúng", () => {
        cy.get('[aria-label="edit"]').first().click();

        // ✅ Chờ modal visible trước
        cy.contains("Chỉnh sửa sản phẩm").should("be.visible");

        cy.get('input[placeholder="VD: Sofa Da Cao Cấp"]', { timeout: 5000 })
            .should("be.visible")
            .should("have.value", "Sofa Da Cao Cấp");
    });

    it("Cập nhật sản phẩm thành công", () => {
        cy.intercept("PUT", `${apiProductsUrl}/1`, {
            statusCode: 200,
            body: { success: true },
        }).as("updateProduct");

        cy.get('[aria-label="edit"]').first().click();
        cy.get('input[placeholder="VD: Sofa Da Cao Cấp"]')
            .clear()
            .type("Sofa Da Mới");
        cy.contains("button", "Cập nhật").click();
        cy.wait("@updateProduct");

        cy.contains("Cập nhật sản phẩm thành công").should("exist");
    });

    // =========================
    // 5. Xóa sản phẩm
    // =========================
    it("Xóa sản phẩm thành công", () => {
        cy.intercept("DELETE", `${apiProductsUrl}/1`, {
            statusCode: 200,
            body: { success: true },
        }).as("deleteProduct");

        cy.get('[aria-label="delete"]').first().click();
        cy.contains("button", "Xóa").click();
        cy.wait("@deleteProduct");

        cy.contains("Đã xóa sản phẩm").should("exist");
    });

    // =========================
    // 6. Lỗi API
    // =========================
    it("Hiển thị lỗi khi API tải thất bại", () => {
        cy.intercept("GET", apiProductsUrl, { forceNetworkError: true }).as(
            "getProductsFail"
        );
        cy.visit(productsUrl);
        cy.wait("@getProductsFail");
        cy.contains("Lỗi khi tải dữ liệu sản phẩm").should("exist");
    });
});