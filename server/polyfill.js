import crypto from 'crypto';

if (!crypto.hash) {
    crypto.hash = (algorithm, data, outputEncoding) => {
        const hash = crypto.createHash(algorithm);
        hash.update(data);
        return hash.digest(outputEncoding);
    };
    console.log('Polyfilled crypto.hash');
}
