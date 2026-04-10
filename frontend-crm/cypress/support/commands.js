// loginBypass: chỉ set token, KHÔNG tự visit trang
// Việc visit sẽ do từng test tự gọi sau khi đã đăng ký intercept
Cypress.Commands.add("loginBypass", () => {
    cy.wrap(null).then(() => {
        window.localStorage.setItem("token", "fake-jwt-token");
    });
});