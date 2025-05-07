
export const PATTERNS = {
  CATEGORY: /show my (\w+) (spending|expenses|breakdown)/i,
  SUMMARY: /(show|get|give) (me )?(a )?(summary|overview|report|analysis)/i,
  DELETE_EXPENSE: /delete (?:my|the) ([\w\s]+) expense/i,
  DELETE_BUDGET: /delete (?:my|the) ([\w\s]+) budget/i,
  DELETE_GOAL: /delete (?:my|the) (?:financial |savings )?goal(?: called| named)? ["|']?([^"']+)["|']?/i,
  GOAL: /(?:set|create)(?: a)? (?:savings |financial )?goal(?: of)? \$?(\d+(?:\.\d+)?)(?: for| to reach| to save)? (?:by|at|on) ([a-zA-Z0-9\s,\/]+)/i,
};
