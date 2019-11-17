describe('Landing Page', function() {
    it('Should say hello there', function() {
        cy.visit('/');

        cy.contains('hello there');
    });
});
