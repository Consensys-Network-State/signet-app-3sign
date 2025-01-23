class SymmetricCrypto {
  static async generateKey() {
      // Generate a random 256-bit key
      const key = await window.crypto.subtle.generateKey(
          {
              name: "AES-GCM",
              length: 256
          },
          true, // extractable
          ["encrypt", "decrypt"]
      );
      return key;
  }

  // Export the key as a Base64 string
  static async exportKey(key) {
      // Export the key to raw bytes
      const rawKey = await window.crypto.subtle.exportKey("raw", key);
      // Convert to Base64
      return this.base64UrlEncode(String.fromCharCode.apply(null, new Uint8Array(rawKey)));
  }

  // Import a key from a Base64 string
  static async importKey(keyBase64) {
      // Convert Base64 to bytes
      const binary = this.base64UrlDecode(keyBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
      }
      
      // Import the key
      return await window.crypto.subtle.importKey(
          "raw",
          bytes,
          "AES-GCM",
          true,
          ["encrypt", "decrypt"]
      );
  }

  static async encrypt(message, key) {
      try {
          // Convert the message to bytes
          const messageBytes = new TextEncoder().encode(message);
          
          // Generate a random initialization vector (IV)
          const iv = window.crypto.getRandomValues(new Uint8Array(12));
          
          // Encrypt the message
          const ciphertext = await window.crypto.subtle.encrypt(
              {
                  name: "AES-GCM",
                  iv: iv
              },
              key,
              messageBytes
          );
          
          // Combine IV and ciphertext for transmission
          const encryptedData = {
              iv: Array.from(iv),
              ciphertext: Array.from(new Uint8Array(ciphertext))
          };
          
          return encryptedData;
      } catch (error) {
          console.error('Encryption failed:', error);
          throw error;
      }
  }

  static async decrypt(encryptedData, key) {
      try {
          // Convert the IV and ciphertext back to Uint8Arrays
          const iv = new Uint8Array(encryptedData.iv);
          const ciphertext = new Uint8Array(encryptedData.ciphertext);
          
          // Decrypt the message
          const decryptedBytes = await window.crypto.subtle.decrypt(
              {
                  name: "AES-GCM",
                  iv: iv
              },
              key,
              ciphertext
          );
          
          // Convert the decrypted bytes back to text
          const decryptedText = new TextDecoder().decode(decryptedBytes);
          return decryptedText;
      } catch (error) {
          console.error('Decryption failed:', error);
          throw error;
      }
  }

  // Serialize encrypted data to a compact string format
  static serializeEncryptedData(encryptedData) {
      // Create a structured object with algorithm information
      const serializedData = {
          alg: "A256GCM",  // AES-256-GCM
          iv: this.arrayToBase64(encryptedData.iv),
          ciphertext: this.arrayToBase64(encryptedData.ciphertext)
      };
      
      // Convert to JSON and then to Base64URL format
      return this.base64UrlEncode(JSON.stringify(serializedData));
  }

  // Deserialize from the compact string format
  static deserializeEncryptedData(serializedString) {
      try {
          // Decode from Base64URL format and parse JSON
          const data = JSON.parse(this.base64UrlDecode(serializedString));
          
          // Verify algorithm
          if (data.alg !== "A256GCM") {
              throw new Error("Unsupported encryption algorithm");
          }
          
          // Convert back to the format needed for decryption
          return {
              iv: this.base64ToArray(data.iv),
              ciphertext: this.base64ToArray(data.ciphertext)
          };
      } catch (error) {
          throw new Error("Invalid serialized data format");
      }
  }

  // Utility method to convert array to Base64
  static arrayToBase64(array) {
      return btoa(String.fromCharCode.apply(null, array));
  }

  // Utility method to convert Base64 to array
  static base64ToArray(base64) {
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
      }
      return Array.from(array);
  }

  static base64UrlEncode(str: string) {
    // Convert string to base64 and make it URL safe
    return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  }
    
  static base64UrlDecode(str: string) {
    // Restore base64 padding
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (str.length % 4) {
    case 0: break;
    case 2: str += '=='; break;
    case 3: str += '='; break;
    default: throw new Error('Invalid base64url string');
    }
    return atob(str);
  }
}

export default SymmetricCrypto;