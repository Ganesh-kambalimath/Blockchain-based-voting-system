const Web3 = require('web3');
const contract = require('@truffle/contract');

const votingArtifacts = require('../../build/contracts/Voting.json');
var VotingContract = contract(votingArtifacts);

window.App = {
  eventStart: async function () {
    try {
      // Request accounts and set provider
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      VotingContract.setProvider(window.ethereum);
      VotingContract.defaults({ from: account, gas: 6654755 });

      // Display the connected account
      $("#accountAddress").html("Your Account: " + account);

      const instance = await VotingContract.deployed();

      // Fetch the total number of candidates
      const countCandidates = await instance.getCountCandidates();

      // Fetch candidates in parallel using Promise.all
      const candidatePromises = [];
      for (let i = 0; i < countCandidates; i++) {
        candidatePromises.push(instance.getCandidate(i + 1));
      }

      const candidates = await Promise.all(candidatePromises);

      // Append candidates to the UI
      candidates.forEach(data => {
        const viewCandidates = `<tr>
          <td><input class="form-check-input" type="radio" name="candidate" value="${data[0]}" id="${data[0]}"></td>
          <td>${data[1]}</td>
          <td>${data[2]}</td>
          <td>${data[3]}</td>
        </tr>`;
        $("#boxCandidate").append(viewCandidates);
      });

      // Add event listener for adding a candidate
      $('#addCandidate').off('click').on('click', async function () {
        const nameCandidate = $('#name').val();
        const partyCandidate = $('#party').val();
        if (!nameCandidate || !partyCandidate) {
          alert("Please fill in both name and party fields.");
          return;
        }
        try {
          await instance.addCandidate(nameCandidate, partyCandidate);
          alert("Candidate added successfully!");
          window.location.reload();
        } catch (err) {
          console.error("Error adding candidate:", err);
          alert("Failed to add candidate. Please try again.");
        }
      });

      // Add event listener for setting dates
      $('#addDate').off('click').on('click', async function () {
        const startDate = Date.parse($("#startDate").val()) / 1000;
        const endDate = Date.parse($("#endDate").val()) / 1000;

        if (isNaN(startDate) || isNaN(endDate)) {
          alert("Please select valid start and end dates.");
          return;
        }

        try {
          await instance.setDates(startDate, endDate);
          alert("Dates updated successfully!");
          window.location.reload();
        } catch (err) {
          console.error("Error setting dates:", err);
          alert("Failed to set dates.");
        }
      });

      // Display voting dates
      const dates = await instance.getDates();
      const startDate = new Date(dates[0] * 1000).toDateString();
      const endDate = new Date(dates[1] * 1000).toDateString();
      $("#dates").text(`${startDate} - ${endDate}`);

      // Check if the user has voted
      const hasVoted = await instance.checkVote();
      if (!hasVoted) {
        $("#voteButton").attr("disabled", false);
      }
    } catch (err) {
      console.error("Error initializing app:", err);
    }
  },

  vote: async function () {
    const candidateID = $("input[name='candidate']:checked").val();
    if (!candidateID) {
      $("#msg").html("<p>Please vote for a candidate.</p>");
      return;
    }

    try {
      const instance = await VotingContract.deployed();
      await instance.vote(parseInt(candidateID));
      $("#voteButton").attr("disabled", true);
      $("#msg").html("<p>Voted</p>");
      window.location.reload();
    } catch (err) {
      console.error("Error during voting:", err);
      alert("Failed to cast vote. Please try again.");
    }
  }
};

window.addEventListener("load", function () {
  if (typeof window.ethereum !== "undefined") {
    console.warn("Using web3 detected from external source like Metamask");
    window.web3 = new Web3(window.ethereum);
  } else {
    console.warn("No web3 detected. Please use Metamask.");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }
  window.App.eventStart();
});

