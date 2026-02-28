---
trigger: always_on
---

Code standards for ArcTreasury:

Solidity:
- Use OpenZeppelin imports for ERC20, Ownable, ReentrancyGuard
- NatSpec comments on every public function
- Events for every state-changing operation
- Custom errors instead of require strings where possible

Python:
- Type hints on all functions
- Pydantic models for all data structures
- Async functions for blockchain calls
- Docstrings on all classes and public methods

React:
- Functional components with hooks only
- Tailwind CSS only, no custom CSS files
- Recharts for all charts
- Lucide-react for icons

General:
- No console.log or print statements in final code
- Descriptive variable names
- Error handling on all external calls (RPC, oracle, API)
- Move fast, working code over perfect code