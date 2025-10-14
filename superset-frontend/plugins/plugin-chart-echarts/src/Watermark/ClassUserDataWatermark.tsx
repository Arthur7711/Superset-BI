import React from 'react';
import { Watermark } from '../UIWatermark';

export default class UserDataWatermarkClass extends React.Component {
  state = {
    email: '',
  };

  async componentDidMount() {
    try {
      const response = await fetch('/api/v1/me/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const data = await response.json();
      this.setState({ email: data.result.email });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  render() {
    const { email } = this.state;
    return <Watermark>{email || 'Loading...'}</Watermark>;
  }
}
