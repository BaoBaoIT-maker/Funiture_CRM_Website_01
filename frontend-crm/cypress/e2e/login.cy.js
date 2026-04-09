describe("Login E2E Test", () => {

    const loginUrl = "/login";
    const apiLoginUrl = "http://localhost:5000/api/auth/login"; // trùng với request frontend gửi

    beforeEach(() => {
        cy.visit(loginUrl);
        cy.clearLocalStorage();
    });

    // =========================
    // 1. Kiểm tra UI
    // =========================
    it("Hiển thị form đăng nhập", () => {
        cy.contains("Đăng nhập").should("exist");

        cy.get('input[placeholder="admin"]').should("be.visible");
        cy.get('input[placeholder="••••••••"]').should("be.visible");

        cy.contains("button", "Vào hệ thống").should("be.visible");
    });

    // =========================
    // 2. Validation khi bỏ trống
    // =========================
    it("Hiển thị lỗi khi bỏ trống", () => {
        cy.contains("button", "Vào hệ thống").click();

        cy.contains("Nhập tên đăng nhập").should("exist");
        cy.contains("Nhập mật khẩu").should("exist");
    });

    // =========================
    // 3. Login thành công (mock API)
    // =========================
    it("Đăng nhập thành công", () => {
        cy.intercept("POST", apiLoginUrl, {
            statusCode: 200,
            body: { token: "fake-jwt-token" }
        }).as("login");

        cy.get('input[placeholder="admin"]').type("admin");
        cy.get('input[placeholder="••••••••"]').type("123");

        cy.contains("button", "Vào hệ thống").click();

        cy.wait("@login");

        // kiểm tra token được lưu vào localStorage
        cy.window().then((win) => {
            expect(win.localStorage.getItem("token")).to.exist;
        });

        // đảm bảo không hiển thị lỗi
        cy.contains("Sai mật khẩu").should("not.exist");
    });

    // =========================
    // 4. Login thất bại (mock API)
    // =========================
    it("Hiển thị lỗi khi sai mật khẩu", () => {
        cy.intercept("POST", apiLoginUrl, {
            statusCode: 401,
            body: { message: "Sai mật khẩu" }
        }).as("login");

        cy.get('input[placeholder="admin"]').type("admin");
        cy.get('input[placeholder="••••••••"]').type("sai123");

        cy.contains("button", "Vào hệ thống").click();

        cy.wait("@login");

        // kiểm tra thông báo lỗi hiển thị đúng text trên UI
        cy.contains("Sai mật khẩu").should("exist");
    });

});