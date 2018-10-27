import random
import argparse

from common import DUMMY, EMPTY, AllKeyValueFactory, IntKeyValueFactory

import hash_chapter2_reimpl_js
import hash_chapter2_impl

TEST_IMPLEMENTATIONS = {
    'js_reimpl': hash_chapter2_reimpl_js
}


def verify_same(ref_hash_codes, ref_keys, hash_codes, keys):
    if (ref_hash_codes, ref_keys) != (hash_codes, keys):
        print("ORIG SIZES", len(ref_hash_codes), len(ref_keys))
        print("NEW SIZES", len(hash_codes), len(keys))
        if len(ref_hash_codes) == len(hash_codes) == len(ref_keys) == len(keys):
            size = len(hash_codes)
            print("NEW | ORIG")
            for i in range(size):
                if ref_hash_codes[i] is not EMPTY or hash_codes[i] is not EMPTY:
                    print(i, " " * 3,
                          ref_hash_codes[i], ref_keys[i], " " * 3,
                          hash_codes[i], keys[i], " " * 3)

    assert ref_hash_codes == hash_codes and ref_keys == keys


def run(ref_impl, test_impl, n_inserts, key_value_factory, initial_state, extra_checks):
    SINGLE_REMOVE_CHANCE = 0.3

    ref_hash_codes, ref_keys = ref_impl.create_new(initial_state)
    test_hash_codes, test_keys = test_impl.create_new(initial_state)

    def vs():
        verify_same(ref_hash_codes, ref_keys, test_hash_codes, test_keys)

    vs()

    print("Starting test")

    for i in range(n_inserts):
        key_to_insert = key_value_factory.generate_key()

        existing_keys = set([k for k in ref_keys if k is not DUMMY and k is not EMPTY])
        fill = sum(1 for k in ref_keys if k is not EMPTY)
        if existing_keys and random.random() < SINGLE_REMOVE_CHANCE:
            key_to_remove = random.choice(list(existing_keys))
            assert ref_impl.has_key(ref_hash_codes, ref_keys, key_to_remove)
            assert test_impl.has_key(test_hash_codes, test_keys, key_to_remove)

            ref_impl.remove(ref_hash_codes, ref_keys, key_to_remove)
            test_impl.remove(test_hash_codes, test_keys, key_to_remove)
            existing_keys.remove(key_to_remove)

            assert not ref_impl.has_key(ref_hash_codes, ref_keys, key_to_remove)
            assert not test_impl.has_key(test_hash_codes, test_keys, key_to_remove)

        is_key_present = ref_impl.has_key(ref_hash_codes, ref_keys, key_to_insert)
        assert (key_to_insert in existing_keys) == is_key_present

        if not is_key_present:
            print("Inserting {}".format(key_to_insert))
            assert not test_impl.has_key(test_hash_codes, test_keys, key_to_insert)
        else:
            print("Re-Inserting {}".format(key_to_insert))

        ref_impl.insert(ref_hash_codes, ref_keys, key_to_insert)
        test_impl.insert(test_hash_codes, test_keys, key_to_insert)
        vs()
        assert test_impl.has_key(test_hash_codes, test_keys, key_to_insert)
        assert ref_impl.has_key(ref_hash_codes, ref_keys, key_to_insert)

        if fill / len(ref_keys) > 0.66:
            ref_hash_codes, ref_keys = ref_impl.resize(ref_hash_codes, ref_keys)
            test_hash_codes, test_keys = test_impl.resize(test_hash_codes, test_keys)
        vs()

        if extra_checks:
            for k in existing_keys:
                assert test_impl.has_key(test_hash_codes, test_keys, k)
                assert ref_impl.has_key(ref_hash_codes, ref_keys, k)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Stress-test chapter2 reimplementation')
    parser.add_argument('--test-implementation', choices=TEST_IMPLEMENTATIONS.keys(), required=True)
    parser.add_argument('--num-inserts',  type=int, default=500)
    parser.add_argument('--forever', action='store_true')
    parser.add_argument('--kv', choices=["numbers", "all"], required=True)
    parser.add_argument('--initial-size', type=int, default=-1)
    parser.add_argument('--extra-getitem-checks', action='store_true', default=False)
    args = parser.parse_args()

    if args.kv == "numbers":
        kv_factory = IntKeyValueFactory(args.num_inserts)
    elif args.kv == "all":
        kv_factory = AllKeyValueFactory(args.num_inserts)

    def test_iteration():
        initial_size = args.initial_size if args.initial_size >= 0 else random.randint(0, 100)
        initial_state = [kv_factory.generate_key() for _ in range(initial_size)]
        run(hash_chapter2_impl,
            TEST_IMPLEMENTATIONS[args.test_implementation],
            n_inserts=args.num_inserts,
            key_value_factory=kv_factory,
            initial_state=initial_state,
            extra_checks=args.extra_getitem_checks)

    if args.forever:
        while True:
            test_iteration()
    else:
        test_iteration()
