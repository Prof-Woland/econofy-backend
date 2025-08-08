export interface getPlans{
    id: string
}

export interface PlanToCache{
    id: string,
    userId: string,
    title: string,
    date: string
    limitMoney: number
    remainder: number
    analysis: string
    recommendations: string
    budgetPlan: string
    term: string
}

export interface IPlanExpenses{
    category: string
}