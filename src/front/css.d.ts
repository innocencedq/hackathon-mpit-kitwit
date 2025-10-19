// CSS type declarations
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Allow Tailwind CSS directives
declare namespace CSS {
  interface AtRules {
    'apply': any;
    'tailwind': any;
    'variants': any;
    'screen': any;
  }
}