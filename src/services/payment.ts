export type PaymentMethod = "card" | "apple" | "google" | "credit";

export type PaymentInput = {
  amount: number;
  currency: "CAD";
  method: PaymentMethod;
  reference: string;
};

export type PaymentResult = {
  success: boolean;
  transactionId: string;
};

export interface PaymentGateway {
  createPayment(input: PaymentInput): Promise<PaymentResult>;
}

export class MockPaymentGateway implements PaymentGateway {
  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return {
      success: input.amount >= 0,
      transactionId: `demo_${input.reference}`,
    };
  }
}

export const mockPaymentGateway = new MockPaymentGateway();
