import { config } from '../config/index.js';

const API_URL = config.flutterwaveSecretKey
  ? 'https://api.flutterwave.com/v3'
  : null;

export class PaymentService {
  constructor() {
    this.configured = Boolean(config.flutterwaveSecretKey);
  }

  async createPayment({ amount, currency = 'RWF', email, phone, paymentType, orderId }) {
    if (!this.configured) {
      return this._mockCreate({ amount, currency, email, phone, paymentType, orderId });
    }

    const paymentData = {
      tx_ref: `FF-${orderId}-${Date.now()}`,
      amount,
      currency,
      redirect_url: `${config.clientUrl}/order-success/${orderId}`,
      customer: {
        email,
        name: email,
        phonenumber: phone,
      },
      customizations: {
        title: 'Flame & Fork Order',
        description: `Order #${orderId}`,
      },
    };

    let endpoint = 'payments';
    if (paymentType === 'mobile_money') {
      paymentData.payment_options = 'mobilemoneyrw';
    } else if (paymentType === 'card') {
      paymentData.payment_options = 'card';
    }

    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await res.json();
    if (!data.status || data.status !== 'success') {
      throw new Error(data.message || 'Payment could not be created');
    }
    return data;
  }

  _mockCreate({ amount, currency, email, phone, paymentType, orderId }) {
    return {
      status: 'success',
      message: 'Payment link created (demo mode)',
      data: {
        link: null,
        reference: `FF-${orderId}-${Date.now()}`,
        status: 'pending',
        amount,
        currency,
        paymentType,
      },
    };
  }
}

export const paymentService = new PaymentService();
