
export interface Trees {
    id: string;
    createdAt: string;
    userId: string;
    treeId: string;
    last_harvest: string;
    purchase_date: string;
    harvest_boolean: boolean;
  }

  export interface ActiveUser {
    id: string;
    name: string;
    email: string;
    balance: number;
  }
  