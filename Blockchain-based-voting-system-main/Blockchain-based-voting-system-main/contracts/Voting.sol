// pragma solidity ^0.5.16;

// contract Voting {
//     struct Candidate {
//         uint id;
//         string name;
//         string party; 
//         uint voteCount;
//     }

//     mapping (uint => Candidate) public candidates;
//     mapping (address => bool) public voters;

    
//     uint public countCandidates;
//     uint256 public votingEnd;
//     uint256 public votingStart;


//     function addCandidate(string memory name, string memory party) public  returns(uint) {
//                countCandidates ++;
//                candidates[countCandidates] = Candidate(countCandidates, name, party, 0);
//                return countCandidates;
//     }
   
//     function vote(uint candidateID) public {

//        require((votingStart <= now) && (votingEnd > now));
   
//        require(candidateID > 0 && candidateID <= countCandidates);

//        //daha önce oy kullanmamıs olmalı
//        require(!voters[msg.sender]);
              
//        voters[msg.sender] = true;
       
//        candidates[candidateID].voteCount ++;      
//     }
    
//     function checkVote() public view returns(bool){
//         return voters[msg.sender];
//     }
       
//     function getCountCandidates() public view returns(uint) {
//         return countCandidates;
//     }

//     function getCandidate(uint candidateID) public view returns (uint,string memory, string memory,uint) {
//         return (candidateID,candidates[candidateID].name,candidates[candidateID].party,candidates[candidateID].voteCount);
//     }

//     function setDates(uint256 _startDate, uint256 _endDate) public{
//         require((votingEnd == 0) && (votingStart == 0) && (_startDate + 1000000 > now) && (_endDate > _startDate));
//         votingEnd = _endDate;
//         votingStart = _startDate;
//     }

//     function getDates() public view returns (uint256,uint256) {
//       return (votingStart,votingEnd);
//     }
// }


pragma solidity ^0.5.16;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string party;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    uint public countCandidates;
    uint256 public votingEnd;
    uint256 public votingStart;

    function addCandidate(string memory name, string memory party) public returns (uint) {
        countCandidates++;
        candidates[countCandidates] = Candidate(countCandidates, name, party);
        return countCandidates;
    }

    function vote(uint candidateID) public {
        require((votingStart <= now) && (votingEnd > now), "Voting period is not active");
        require(candidateID > 0 && candidateID <= countCandidates, "Invalid candidate ID");
        require(!voters[msg.sender], "You have already voted");

        voters[msg.sender] = true;
    }

    function checkVote() public view returns (bool) {
        return voters[msg.sender];
    }

    function getCountCandidates() public view returns (uint) {
        return countCandidates;
    }

    function getCandidate(uint candidateID) public view returns (uint, string memory, string memory) {
        Candidate memory candidate = candidates[candidateID];
        return (candidate.id, candidate.name, candidate.party);
    }

    function setDates(uint256 _startDate, uint256 _endDate) public {
        require(votingEnd == 0 && votingStart == 0, "Voting dates already set");
        require(_startDate + 1000000 > now, "Start date must be in the future");
        require(_endDate > _startDate, "End date must be after start date");
        votingEnd = _endDate;
        votingStart = _startDate;
    }

    function getDates() public view returns (uint256, uint256) {
        return (votingStart, votingEnd);
    }
}
