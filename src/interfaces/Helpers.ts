export interface Combine {
  (obj1?: AnyObject, obj2?: AnyObject): AnyObject;
}

export type AnyObject = Record<string, unknown>;
