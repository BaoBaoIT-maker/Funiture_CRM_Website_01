describe("Login E2E Test (Real Backend)", () => {

    beforeEach(() => {
        cy.visit("/login");
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
    // 2. Validation
    // =========================
    it("Hiển thị lỗi khi bỏ trống", () => {
        cy.contains("button", "Vào hệ thống").click();

        cy.contains("Nhập tên đăng nhập").should("exist");
        cy.contains("Nhập mật khẩu").should("exist");
    });

    // =========================
    // 3. Login thành công (functional)
    // =========================
    it("Đăng nhập thành công", () => {
        cy.intercept("POST", "/api/auth/login").as("login");

        cy.get('input[placeholder="admin"]').clear().type("admin");
        cy.get('input[placeholder="••••••••"]').clear().type("123");

        cy.contains("button", "Vào hệ thống").click();

        cy.wait("@login").then((interception) => {
            expect(interception.response.statusCode).to.eq(200);

            const body = interception.response.body;
            expect(body).to.satisfy((b) =>
                b.token || b.accessToken || b.data?.token
            );
        });

        cy.window().then((win) => {
            expect(win.localStorage.getItem("token")).to.exist;
        });

        cy.contains("Đăng nhập thất bại").should("not.exist");
    });

    // =========================
    // 4. Login thất bại (CÁCH 3 - chuẩn nhất)
    // =========================
    it("Hiển thị lỗi khi sai mật khẩu", () => {
        cy.intercept("POST", "/api/auth/login").as("login");

        cy.get('input[placeholder="admin"]').type("admin");
        cy.get('input[placeholder="••••••••"]').type("sai123");

        cy.contains("button", "Vào hệ thống").click();

        // ✅ 1. API phải fail
        cy.wait("@login").then((interception) => {
            expect(interception.response.statusCode).to.be.oneOf([400, 401]);
        });

        // ✅ 2. Không có token (QUAN TRỌNG NHẤT)
        cy.window().then((win) => {
            expect(win.localStorage.getItem("token")).to.be.null;
        });

    });

});