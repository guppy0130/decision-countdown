let nanoid = '';
describe('Landing Page', function() {
    it('Should have basic elements', function() {
        cy.visit('/');
        // there should be a title
        cy.contains('Decision Countdown').should('have.length', 1).and('be.visible');
        // there should be one slider for the time
        cy.get('.b-slider').should('have.length', 1).and('be.visible');
        // there should be 4 ticks
        cy.get('.b-slider-tick-label').should('have.length', 4).and('be.visible');
        // there should be only one submit button
        cy.get('.is-success').should('have.length', 1).and('be.visible');
        // there should be two input fields
        cy.get('input').should('have.length', 2).and('be.visible');
        // there should be three headers: question, time, options
        for (let word of ['Question', 'Time', 'Options']) {
            cy.contains(word).should('have.length', 1).and('be.visible');
        }
    });

    it('Should accept input', function() {
        // write to the question
        cy.get('input').first().type('Is this a question?');
        // set a time
        cy.contains('20').click();
        // add some options
        cy.get('input').last().type('Yes');
        cy.get('.mdi-plus').click();
        // clicking this resets the field
        cy.get(':nth-child(3) > .field > .control > .input').should('be.empty');
        // the other way to add an option is via the enter key
        cy.get(':nth-child(3) > .field > .control > .input').type('No {enter}');
        // and again, the field should be empty
        cy.get(':nth-child(3) > .field > .control > .input').should('be.empty');
        // there should be two trash cans
        cy.get('.mdi-delete').should('have.length', 2).and('be.visible');
    });

    it('Shows a link, vote, and results after clicking', function() {
        // we should submit the form now
        cy.get('.is-success').click();
        // there should be a link
        cy.contains('respond').should('have.length', 1).and('be.visible');
        // there should be a copy button, so let's click it
        cy.get('.mdi-content-copy').should('have.length', 1).and('be.visible').click();
        // a snackbar should be visible
        cy.get('.snackbar').should('have.length', 1).and('be.visible').contains('Copied to clipboard');
        // and there should be a vote button
        cy.contains('Vote').should('have.length', 1).and('be.visible').and('have.attr', 'href').and('match', /respond/);
        // and a results button
        cy.contains('Results').should('have.length', 1).and('be.visible').and('have.attr', 'href').and('match', /results/);
        cy.get('.has-addons > .control > .input').invoke('val')
            .then(url => {
                nanoid = url.slice(-6);
                cy.log(nanoid);
            });
    });
});

describe('Respond Page', function() {
    it('Should have basic elements', function () {
        cy.visit(`/respond/${nanoid}`);
        // there should be a title
        cy.contains('Decision Countdown').should('have.length', 1).and('be.visible');
        // the question should be determined and disabled
        cy.get('input').should('have.length', 1).and('be.visible').and('be.disabled').invoke('val')
            .then(query => {
                cy.wrap(query).should('eq', 'Is this a question?');
            });
        // there should be one slider for the time
        cy.get('.b-slider').should('have.length', 1).and('be.visible');
        // there should be 4 ticks
        cy.get('.b-slider-tick-label').should('have.length', 4).and('be.visible');
        // there should be two options
        cy.get('button').should('have.length', 2).and('be.visible');
        cy.contains('Yes').should('have.length', 1).and('be.visible');
        cy.contains('No').should('have.length', 1).and('be.visible');
    });

    it('Options should be clickable', function() {
        // we should click one
        cy.contains('Yes').click();
        cy.contains('Yes').should('be.disabled').and('has.class', 'is-success');
        cy.get('button').should('have.length', 1).and('be.visible');
    });
});

describe('Votes Page', function() {
    it('Should have basic elements', function () {
        cy.visit(`/results/${nanoid}`);
        // there should be a title
        cy.contains('Decision Countdown').should('have.length', 1).and('be.visible');
        // the question should be determined and there should be a searchable header
        cy.contains('Is this a question?');
        cy.get('input').should('have.length', 2).and('be.visible');
        // and there should be a table
        cy.get('.b-table').should('have.length', 1).and('be.visible');
        // Yes should have a value of 1
        cy.get(':nth-child(1) > .has-text-right').invoke('text')
            .then(val => {
                cy.wrap(val.trim()).should('eq', '1');
            });
    });
});
