/* Made-up members for the preview only. Real data comes from the Apps Script engine. */
window.MT_DEMO = (function () {
  var arsenal = { team: "Arsenal (A)", comp: "Premier League", when: "Sun 29 Nov · KO 4:30pm" };
  var brentford = { team: "Brentford (A)", comp: "Premier League", when: "Sat 5 Dec · KO 8:00pm" };
  var barca = { team: "Barcelona (A)", comp: "Champions League", when: "Tue 8 Dec · KO 8:00pm UK" };
  var newcastle = { team: "Newcastle (A)", comp: "Premier League", when: "Sat 26 Dec · KO 8:00pm" };
  var everton = { team: "Everton (A)", comp: "Premier League", when: "Tue 29 Dec · KO 8:15pm" };
  function g(base, x) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in x) o[k] = x[k]; return o; }
  return {
    greeting: "Hi Dave and Sam",
    updated: "Sun 15 Nov, 8:20am",
    nextMeeting: { when: "Mon 30 Nov, 7pm", where: "Cheadle & Gatley Conservative Club" },
    people: [
      { name: "Dave", games: [
        g(arsenal, { tone: "green", ticketShort: "Got a ticket", ticketLine: "You’ve got a ticket through the branch.", paidLine: "Paid – thanks. Your ticket will be emailed to you nearer the game.", coachShort: "Coach booked", coachLine: "Booked. Club opens 8:30am, coach leaves 9:30am. £45.", next: "Nothing to do. Look out for an email from Pete with your ticket." }),
        g(brentford, { tone: "amber", ticketShort: "Applied", ticketLine: "You’ve applied. Tickets are still being bought.", coachShort: "Coach if successful", coachLine: "Yes, if you get a ticket. £45, times to be confirmed.", next: "Pete will update you once tickets are allocated." }),
        g(barca, { tone: "amber", ticketShort: "Applied", ticketLine: "You’ve applied. Waiting for the allocation.", next: "Pete will update you once tickets are allocated." }),
        g(newcastle, { tone: "grey", ticketShort: "Not applied", ticketLine: "You haven’t applied for this game.", next: "You can apply at the branch meeting on Mon 30 Nov." }),
        g(everton, { tone: "yellow", ticketShort: "Supporters club ticket", ticketLine: "You’ve been allocated a ticket through the supporters club allocation.", paidLine: "Pay Man City directly (not Pete) when the notification arrives in your Man City app / ticketing account.", action: "Action: pay Man City when asked", coachShort: "Coach booked", coachLine: "Booked. Club opens 1:00pm, coach leaves 2:00pm. £25. Pub stop at Carr Mill, St Helens.", next: "Once you’ve paid Man City, please let Pete know. City will send your ticket nearer the game." })
      ]},
      { name: "Sam", games: [
        g(arsenal, { tone: "red", ticketShort: "Unsuccessful", ticketLine: "Sorry, unsuccessful – all tickets have been allocated." }),
        g(brentford, { tone: "amber", ticketShort: "Applied", ticketLine: "You’ve applied. Tickets are still being bought.", coachShort: "Not on bus", coachLine: "Not on the bus (you said you’re travelling separately).", next: "Pete will update you once tickets are allocated." }),
        g(newcastle, { tone: "grey", ticketShort: "Not applied", ticketLine: "You haven’t applied for this game.", next: "You can apply at the branch meeting on Mon 30 Nov." }),
        g(everton, { tone: "green", ticketShort: "Got a ticket", ticketLine: "You’ve got a ticket through the branch.", paidLine: "To pay Pete: £[PRICE]. Pete will send your ticket once you’ve paid.", action: "Action: pay Pete £[PRICE]", coachShort: "Coach booked", coachLine: "Booked. Club opens 1:00pm, coach leaves 2:00pm. £25.", next: "Pay Pete, then he’ll email your ticket." })
      ]}
    ]
  };
})();
