import React from 'react';
import ReactDOM from 'react-dom';
import {Results} from '../../src/components/Results';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    Simulate
} from 'react-addons-test-utils';
import {expect} from 'chai';
import {List, Map} from 'immutable';



describe('Results', () => {

    it('renders entries with vote counts or zero', () => {
        const pair = List.of('Trainspotting', '28 Days Later');
        const tally = Map({'Trainspotting': 4});
        const component = renderIntoDocument(
            <Results pair={pair} tally={tally} />
        );

        const entries = scryRenderedDOMComponentsWithClass(component, 'entry');
        const [train, days] = entries.map(e => e.textContent);

        expect(entries.length).to.equal(2);
        expect(train).to.contains('Trainspotting');
        expect(train).to.contains(4);
        expect(days).to.contains('28 Days Later');
        expect(days).to.contains(0);
    });

    it('invokes the next callback when next button is clicked', () => {
        let nextInvoked = false;
        const next = () => nextInvoked = true;

        const pair = List.of('Trainspotting', '28 Days Later');
        const component = renderIntoDocument(
            <Results pair={pair}
                     tally={Map()}
                     next={next}/>
        );
        Simulate.click(ReactDOM.findDOMNode(component.refs.next));

        expect(nextInvoked).to.equal(true);
    });

    it('renders the winner when there is one', () => {
        const component = renderIntoDocument(
            <Results winner="Trainspotting"
                     pair={["Trainspotting", "28 Days Later"]}
                     tally={Map()} />
        );
        const winner = ReactDOM.findDOMNode(component.refs.winner);
        expect(winner).to.be.ok;
        expect(winner.textContent).to.contain('Trainspotting');
    });


});