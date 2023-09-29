/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "@quramy/jest-prisma/environment",
  rootDir:".",
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1"
 },
 testEnvironmentOptions: {
  verboseQuery: true,
  enableExperimentalRollbackInTransaction: true, // <- add this
},
  transform:{
    "^.+\\.(t|j)s$":['ts-jest',{
      tsconfig:'tsconfig.json'
    }]
  }
};