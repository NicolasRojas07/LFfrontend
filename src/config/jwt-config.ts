/**
 * JWT Configuration - mirrors backend ALLOWED_ALGORITHMS
 * Backend: ./app/config.py
 */
export const ALLOWED_ALGORITHMS = ["HS256", "HS384", "HS512"] as const;

export type AllowedAlgorithm = typeof ALLOWED_ALGORITHMS[number];

export const isAlgorithmAllowed = (alg: string): alg is AllowedAlgorithm => {
  return ALLOWED_ALGORITHMS.includes(alg as AllowedAlgorithm);
};

export const ALGORITHM_INFO = {
  HS256: { name: "HS256" },
  HS384: { name: "HS384"},
  HS512: { name: "HS512"},
} as const;
