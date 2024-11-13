
export interface UserTrees {
    id: string;
    createdAt: string;
    userId: string;
    tree_id: string;
    last_harvest: string;
    purchase_date: string;
    harvest_boolean: boolean;
  }
export interface Trees {
    id: string;
    name: string;
    price: number;
    description: string;
    oxygen_per_day: number;
    image_url: string;
  }

  export interface ActiveUser {
    id: string;
    name: string;
    email: string;
    balance: number;
    spots: number;
  }
  