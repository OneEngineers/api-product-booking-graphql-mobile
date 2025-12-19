import { Field, InputType, ObjectType } from 'type-graphql';
import GraphQLJSON from 'graphql-type-json';
import { AnyObject } from '../../types';
import { DataResponse } from './dataResponseTypeDefs';
import { Preference } from '../../entities';

@ObjectType()
export class DataPreference extends DataResponse(
  Preference,
  'PreferenceData'
) {}

@InputType()
export class PreferenceInput {
  @Field(() => GraphQLJSON)
  preference: AnyObject;
}
