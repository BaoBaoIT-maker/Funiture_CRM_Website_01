Cypress.Commands.add("loginBypass", () => {
    cy.visit("/login", {
        onBeforeLoad(win) {
            win.localStorage.setItem("token", "fake-jwt-token");
        },
    });
});
