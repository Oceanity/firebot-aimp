declare module "*.html" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: ArrayBuffer;
  export default value;
}
