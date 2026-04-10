Cypress.Commands.add("loginBypass", () => {
    // Set thẳng token vào localStorage, không cần gọi API thật
    cy.window().then((win) => {
        win.localStorage.setItem("token", "fake-jwt-token");
    });
});