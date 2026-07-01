<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Form\API;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

final class AttendanceImportApiForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('user', IntegerType::class, [
            'required' => false,
            'documentation' => [
                'description' => 'User ID to import records for. Defaults to the current API user.',
            ],
        ]);
        $builder->add('source', TextType::class, [
            'required' => false,
            'documentation' => [
                'description' => 'External source identifier (default: external)',
                'example' => 'dingtalk',
            ],
        ]);
        $builder->add('records', CollectionType::class, [
            'entry_type' => AttendanceRecordImportRowType::class,
            'allow_add' => true,
            'constraints' => [
                new Assert\Count(min: 1),
            ],
            'documentation' => [
                'description' => 'Attendance records to import or update',
            ],
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'mapped' => false,
        ]);
    }
}
